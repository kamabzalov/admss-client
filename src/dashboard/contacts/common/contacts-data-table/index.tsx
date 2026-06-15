import { useEffect, useState, useCallback } from "react";
import {
    getContacts,
    getContactsAmount,
    getContactsTypeList,
} from "http/services/contacts-service";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { QueryParams } from "common/models/query-params";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { useNavigate } from "react-router-dom";
import { ROWS_PER_PAGE } from "common/settings";
import { ContactType, ContactTypeNameList, ContactUser } from "common/models/contact";
import { ContactsUserSettings, TableState } from "common/models/user";
import { usePermissions } from "common/hooks/usePermissions";
import { useCreateReport, useToastMessage } from "common/hooks";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import { DropdownChangeEvent } from "primereact/dropdown";
import { CONTACTS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";
import { getColumnPtStyles } from "dashboard/common/data-table";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import ContactsHeader from "dashboard/contacts/components/ContactsHeader";
import ContactsAdvancedSearch from "dashboard/contacts/components/ContactsAdvancedSearch";
import {
    alwaysActiveColumns,
    formatContactFieldValue,
    getSortColumn,
    selectableColumns,
    TableColumnsList,
} from "dashboard/contacts/common/data-table";

export interface ContactsDataTableProps {
    onRowClick?: (companyName: string) => void;
    contactCategory?: ContactTypeNameList | string;
    originalPath?: string;
    returnedField?: keyof ContactUser;
    getFullInfo?: (contact: ContactUser) => void;
}

export const ContactsDataTable = ({
    onRowClick,
    contactCategory,
    originalPath,
    returnedField,
    getFullInfo,
}: ContactsDataTableProps) => {
    const [categories, setCategories] = useState<ContactType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ContactType | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [contacts, setUserContacts] = useState<ContactUser[]>([]);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const {
        activeColumns,
        setActiveColumnsAndSave,
        serverSettings,
        setModuleSettings,
        settingsLoaded,
    } = useUserProfileSettings<ContactsUserSettings, TableColumnsList>(
        "contacts",
        selectableColumns
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { contactPermissions } = usePermissions();
    const { showWarning } = useToastMessage();
    const store = useStore().contactStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const { createReport } = useCreateReport<ContactUser>();

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        setIsLoading(true);
        const allColumns = [...alwaysActiveColumns, ...activeColumns];
        await createReport({
            userId: authUser.useruid,
            items: contacts,
            columns: allColumns.map((column) => ({
                field: column.field as keyof ContactUser,
                header: column.header as string,
            })),
            print,
            name: "contacts",
            valueFormatter: (value, key, item) =>
                formatContactFieldValue(key as TableColumnsList["field"], item),
        });
        setIsLoading(false);
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const handleGetContactsList = async (params: QueryParams, total?: boolean) => {
        if (authUser) {
            const queryString = params.qry ? encodeURIComponent(params.qry) : "";
            const updatedParams = { ...params, qry: queryString };

            if (total) {
                const response = await getContactsAmount(authUser.useruid, {
                    ...updatedParams,
                    total: 1,
                });
                setTotalRecords(response?.total ?? 0);
            }
            const response = await getContacts(authUser.useruid, updatedParams);
            if (Array.isArray(response) && response.length) {
                setUserContacts(response);
            } else {
                setUserContacts([]);
            }
            setIsLoading(false);
        }
    };

    const handleGetContactsTypeList = useCallback(async () => {
        const response = await getContactsTypeList();
        if (response) {
            const types = response as ContactType[];
            if (types?.length) {
                if (contactCategory) {
                    const category = types?.find((item) => item.name === contactCategory);
                    setSelectedCategory(category ?? null);
                }
            }
            setCategories(types);
        }
    }, [contactCategory]);

    useEffect(() => {
        !categories.length && handleGetContactsTypeList();
    }, [categories.length, handleGetContactsTypeList]);

    useEffect(() => {
        if (!authUser) return;
        const params: QueryParams = {
            ...(selectedCategory?.id && { param: selectedCategory.id }),
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(globalSearch && { qry: globalSearch }),
            ...(lazyState.sortField && { column: getSortColumn(lazyState.sortField) }),
            skip: lazyState.first,
            top: lazyState.rows,
        };
        if (!selectedCategory && contactCategory) {
            return;
        }
        if (!settingsLoaded) {
            return;
        }
        setIsLoading(true);

        handleGetContactsList(params, true);
    }, [selectedCategory, lazyState, authUser, globalSearch, contactCategory, settingsLoaded]);

    useEffect(() => {
        if (!settingsLoaded || !serverSettings) return;

        const moduleSettings = serverSettings?.contacts;
        if (!contactCategory && moduleSettings?.selectedCategoriesOptions) {
            const savedCategory: ContactType[] = moduleSettings.selectedCategoriesOptions;
            if (Array.isArray(savedCategory) && savedCategory.length) {
                setSelectedCategory(savedCategory[0]);
            } else {
                setSelectedCategory(savedCategory as unknown as ContactType);
            }
        }
        if (moduleSettings?.table) {
            setLazyState({
                first: moduleSettings.table.first || initialDataTableQueries.first,
                rows: moduleSettings.table.rows || initialDataTableQueries.rows,
                page: moduleSettings.table.page || initialDataTableQueries.page,
                column: moduleSettings.table.column || initialDataTableQueries.column,
                sortField: moduleSettings.table.sortField || initialDataTableQueries.sortField,
                sortOrder: moduleSettings.table.sortOrder || initialDataTableQueries.sortOrder,
            });
        }
    }, [settingsLoaded, serverSettings, contactCategory]);

    const changeSettings = (settings: Partial<ContactsUserSettings>) => {
        if (!authUser) return;
        setModuleSettings(settings);
    };

    const handleOnRowClick = ({ data }: DataTableRowClickEvent): void => {
        const selectedText = window.getSelection()?.toString();

        if (!!selectedText?.length) {
            return;
        }
        if (getFullInfo) {
            getFullInfo(data as ContactUser);
        }
        if (onRowClick) {
            const value = returnedField
                ? data[returnedField]
                : data.companyName || data.businessName || `${data.firstName} ${data.lastName}`;
            onRowClick(value);
        }
    };

    const handleCreateContact = () => {
        if (!contactPermissions.canCreate()) {
            showWarning("You don't have permission to create contacts.");
            return;
        }
        if (originalPath) {
            store.memoRoute = originalPath;
        }
        navigate(CONTACTS_PAGE.CREATE());
    };

    const bodyDataRender = (field: TableColumnsList["field"]) => {
        return (rowData: ContactUser) => {
            const value = formatContactFieldValue(field, rowData);
            return <TruncatedText text={value} withTooltip />;
        };
    };

    const handleChangeCategory = (e: DropdownChangeEvent) => {
        if (contactCategory) return;
        changeSettings({
            selectedCategoriesOptions: e.value,
        });
        setSelectedCategory(e.value);
    };

    return (
        <div className='card-content'>
            <ContactsHeader
                globalSearch={globalSearch}
                onGlobalSearchChange={setGlobalSearch}
                onAdvancedSearchClick={() => setDialogVisible(true)}
                onCreateContact={handleCreateContact}
                onPrint={() => printTableData(true)}
                onDownload={() => printTableData()}
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleChangeCategory}
                categoryDisabled={!!contactCategory}
                selectableColumns={selectableColumns}
                activeColumns={activeColumns}
                onColumnsChange={setActiveColumnsAndSave}
                settingsLoaded={settingsLoaded}
            />
            {isLoading ? (
                <div className='dashboard-loader__wrapper'>
                    <Loader />
                </div>
            ) : (
                <DataTable
                    showGridlines
                    value={contacts}
                    lazy
                    scrollable
                    scrollHeight='auto'
                    paginator
                    first={lazyState.first}
                    rows={lazyState.rows}
                    rowsPerPageOptions={ROWS_PER_PAGE}
                    totalRecords={totalRecords || 1}
                    onPage={pageChanged}
                    onSort={sortData}
                    sortOrder={lazyState.sortOrder}
                    sortField={lazyState.sortField}
                    resizableColumns
                    emptyMessage={ERROR_MESSAGES.NO_DATA}
                    reorderableColumns
                    rowClassName={() => "table-row"}
                    onRowClick={handleOnRowClick}
                    onColReorder={(event) => {
                        if (authUser && Array.isArray(event.columns) && settingsLoaded) {
                            const orderArray = event.columns?.map(
                                (column: any) => column.props.field
                            );

                            const newActiveColumns = orderArray
                                .map((field: string) => {
                                    return (
                                        activeColumns.find((column) => column.field === field) ||
                                        null
                                    );
                                })
                                .filter(
                                    (column): column is TableColumnsList => column !== null
                                ) as TableColumnsList[];

                            setActiveColumnsAndSave(newActiveColumns);
                        }
                    }}
                    onColumnResizeEnd={(event) => {
                        if (authUser && event) {
                            const newColumnWidth = {
                                [event.column.props.field as string]: event.element.offsetWidth,
                            };
                            changeSettings({
                                columnWidth: {
                                    ...serverSettings?.contacts?.columnWidth,
                                    ...newColumnWidth,
                                },
                            });
                        }
                    }}
                >
                    <Column
                        bodyStyle={{ textAlign: "center" }}
                        reorderable={false}
                        resizeable={false}
                        body={({ contactuid }: ContactUser) => {
                            return (
                                <Button
                                    disabled={!contactPermissions.canEdit()}
                                    severity={
                                        contactPermissions.canEdit() ? "success" : "secondary"
                                    }
                                    text
                                    className='table-edit-button'
                                    icon='adms-edit-item'
                                    tooltip='Edit contact'
                                    tooltipOptions={{
                                        position: "right",
                                        className: "tooltip-tail-left",
                                    }}
                                    onClick={() =>
                                        contactPermissions.canEdit() &&
                                        navigate(CONTACTS_PAGE.EDIT(contactuid))
                                    }
                                />
                            );
                        }}
                        pt={{
                            root: {
                                style: {
                                    width: "60px",
                                },
                            },
                        }}
                    />
                    {alwaysActiveColumns.map(({ field, header }, index) => {
                        const savedWidth = serverSettings?.contacts?.columnWidth?.[field];
                        const isLastColumn =
                            index === alwaysActiveColumns.length - 1 && activeColumns.length === 0;

                        return (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                sortable
                                body={bodyDataRender(field)}
                                headerClassName='cursor-move'
                                pt={getColumnPtStyles({
                                    savedWidth,
                                    isLastColumn,
                                    additionalStyles: { borderLeft: !index ? "none" : "" },
                                })}
                            />
                        );
                    })}
                    {activeColumns.map(({ field, header }: TableColumnsList, index) => {
                        const savedWidth = serverSettings?.contacts?.columnWidth?.[field];
                        const isLastColumn = index === activeColumns.length - 1;

                        return (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                sortable
                                headerClassName='cursor-move'
                                body={bodyDataRender(field)}
                                pt={getColumnPtStyles({ savedWidth, isLastColumn })}
                            />
                        );
                    })}
                </DataTable>
            )}
            <ContactsAdvancedSearch
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                lazyState={lazyState}
                onSearch={handleGetContactsList}
            />
        </div>
    );
};
