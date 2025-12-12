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
import "./index.css";
import { ROWS_PER_PAGE } from "common/settings";
import { ContactType, ContactTypeNameList, ContactUser } from "common/models/contact";
import { ContactsUserSettings, TableState } from "common/models/user";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { makeShortReports } from "http/services/reports.service";
import { ReportsColumn } from "common/models/reports";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import {
    AdvancedSearchDialog,
    SEARCH_FIELD_TYPE,
    SEARCH_FORM_TYPE,
    SearchField,
} from "dashboard/common/dialog/search";
import { createStringifySearchQuery, formatPhoneNumber, isObjectValuesEmpty } from "common/helpers";
import { ComboBox } from "dashboard/common/form/dropdown";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { ColumnSelector, TableColumn } from "dashboard/common/filter";
import { DropdownChangeEvent } from "primereact/dropdown";
import { CONTACTS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";

interface TableColumnsList extends TableColumn {
    field: keyof ContactUser | "fullName";
}

interface AdvancedSearch {
    [key: string]: string | number;
    username: string;
    type: number;
    phone1: string;
    phone2: string;
}

interface ContactsDataTableProps {
    onRowClick?: (companyName: string) => void;
    contactCategory?: ContactTypeNameList | string;
    originalPath?: string;
    returnedField?: keyof ContactUser;
    getFullInfo?: (contact: ContactUser) => void;
}

const alwaysActiveColumns: TableColumnsList[] = [
    { field: "fullName", header: "Name", checked: true },
    { field: "phone1", header: "Work Phone", checked: true },
    { field: "created", header: "Created", checked: true },
];

const selectableColumns: TableColumnsList[] = [
    { field: "phone2", header: "Home Phone", checked: false, isSelectable: true },
    { field: "fullAddress", header: "Address", checked: false, isSelectable: true },
    { field: "email1", header: "Email", checked: false, isSelectable: true },
];

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
    const store = useStore().contactStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearch>({} as AdvancedSearch);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        setIsLoading(true);
        const allColumns = [...alwaysActiveColumns, ...activeColumns];
        const columns: ReportsColumn[] = allColumns.map((column) => ({
            name: column.header as string,
            data: column.field as string,
        }));
        const date = new Date();
        const name = `contacts_${
            date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

        const data = contacts.map((item) => {
            const filteredItem: Record<string, any> = {};
            columns.forEach((column) => {
                if (item.hasOwnProperty(column.data)) {
                    filteredItem[column.data] = item[column.data as keyof typeof item];
                }
            });
            return filteredItem;
        });
        const JSONreport = {
            name,
            itemUID: "0",
            data,
            columns,
            format: "",
        };
        await makeShortReports(authUser.useruid, JSONreport).then((response) => {
            const url = new Blob([response], { type: "application/pdf" });
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(url);
            if (!print) {
                link.download = `Report-${name}.pdf`;
                link.click();
            }

            if (print) {
                window.open(
                    link.href,
                    "_blank",
                    "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                );
            }
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

    const getSortColumn = (field: string | undefined) => {
        if (field === "fullName") {
            return "userName";
        }
        return field;
    };

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
        } else {
            navigate(data.contactuid);
        }
    };

    const renderFullName = (rowData: ContactUser) => {
        return rowData.businessName || `${rowData.firstName} ${rowData.lastName}`;
    };

    const handleCreateContact = () => {
        if (originalPath) {
            store.memoRoute = originalPath;
        }
        navigate("/dashboard/contacts/create");
    };

    const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string | number) => {
        setIsLoading(true);
        setAdvancedSearch((prevSearch) => {
            const newSearch = { ...prevSearch, [key]: value };

            const isAnyValueEmpty = isObjectValuesEmpty(newSearch);

            setButtonDisabled(isAnyValueEmpty);

            return newSearch;
        });
        setIsLoading(false);
    };

    const handleAdvancedSearch = () => {
        const searchQuery = Object.entries(advancedSearch)
            .filter(([_, value]) => value)
            .map(([key, value]) => `${value}.${key}`)
            .join("+");

        handleGetContactsList({ qry: searchQuery }, true);
        setDialogVisible(false);
    };

    const handleClearAdvancedSearchField = async (key: keyof AdvancedSearch) => {
        setButtonDisabled(true);
        setAdvancedSearch((prev) => {
            const updatedSearch = { ...prev };
            delete updatedSearch[key];
            return updatedSearch;
        });

        try {
            const updatedSearch = { ...advancedSearch };
            delete updatedSearch[key];

            const isAdvancedSearchEmpty = isObjectValuesEmpty(advancedSearch);
            const params: QueryParams = {
                ...(lazyState.sortOrder === 1 && { type: "asc" }),
                ...(lazyState.sortOrder === -1 && { type: "desc" }),
                ...(!isAdvancedSearchEmpty && { qry: createStringifySearchQuery(updatedSearch) }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            await handleGetContactsList(params);
        } finally {
            setButtonDisabled(false);
        }
    };

    const searchFields: SearchField<AdvancedSearch>[] = [
        {
            key: "username",
            label: "Contact name",
            value: advancedSearch?.username,
            type: SEARCH_FIELD_TYPE.TEXT,
        },

        {
            key: "type",
            label: "Contact type",
            value: advancedSearch?.type?.toString(),
            type: SEARCH_FIELD_TYPE.DROPDOWN,
        },
        {
            key: "phone1",
            label: "Work phone",
            value: advancedSearch.phone1,
            type: SEARCH_FIELD_TYPE.NUMBER,
        },
        {
            key: "phone2",
            label: "Home phone",
            value: advancedSearch.phone2,
            type: SEARCH_FIELD_TYPE.NUMBER,
        },
    ];

    const bodyDataRender = (field: keyof ContactUser | "fullName") => {
        return (rowData: ContactUser) => {
            let value = "";

            switch (field) {
                case "fullName":
                    value = renderFullName(rowData);
                    break;
                case "phone1":
                case "phone2":
                    value = formatPhoneNumber(rowData[field]);
                    break;
                default:
                    value = String(rowData[field] || "");
            }

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
            <div className='table-controls contact-controls'>
                <GlobalSearchInput
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                />
                <Button
                    className='contact-top-controls__button m-r-20px'
                    label='Advanced search'
                    severity='success'
                    type='button'
                    onClick={() => setDialogVisible(true)}
                />

                <Button
                    className='contact-top-controls__button'
                    icon='icon adms-add-item'
                    severity='success'
                    type='button'
                    tooltip='Add new contact'
                    onClick={handleCreateContact}
                />
                <Button
                    severity='success'
                    type='button'
                    icon='icon adms-print'
                    tooltip='Print contacts form'
                    onClick={() => printTableData(true)}
                />
                <Button
                    severity='success'
                    type='button'
                    icon='icon adms-download'
                    tooltip='Download contacts form'
                    onClick={() => printTableData()}
                />

                <ComboBox
                    value={selectedCategory}
                    onChange={handleChangeCategory}
                    options={categories}
                    optionLabel='name'
                    editable
                    disabled={!!contactCategory}
                    placeholder='Category'
                    className='category-selector ml-auto'
                    pt={{
                        wrapper: {
                            style: {
                                maxHeight: "500px",
                            },
                        },
                    }}
                />
                <ColumnSelector<TableColumnsList>
                    selectableColumns={selectableColumns}
                    activeColumns={activeColumns}
                    onColumnsChange={(columns) => {
                        if (settingsLoaded) {
                            setActiveColumnsAndSave(columns);
                        }
                    }}
                    className='contacts-filter'
                />
            </div>
            <div className='grid'>
                <div className='col-12'>
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
                            scrollHeight='70vh'
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
                                                activeColumns.find(
                                                    (column) => column.field === field
                                                ) || null
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
                                        [event.column.props.field as string]:
                                            event.element.offsetWidth,
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
                                            text
                                            className='table-edit-button'
                                            icon='adms-edit-item'
                                            tooltip='Edit contact'
                                            tooltipOptions={{ position: "mouse" }}
                                            onClick={() => navigate(CONTACTS_PAGE.EDIT(contactuid))}
                                        />
                                    );
                                }}
                                pt={{
                                    root: {
                                        style: {
                                            width: "80px",
                                        },
                                    },
                                }}
                            />
                            {alwaysActiveColumns.map(({ field, header }, index) => {
                                const savedWidth = serverSettings?.contacts?.columnWidth?.[field];

                                return (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        body={bodyDataRender(field)}
                                        headerClassName='cursor-move'
                                        pt={{
                                            root: {
                                                style: savedWidth
                                                    ? {
                                                          width: `${savedWidth}px`,
                                                          maxWidth: `${savedWidth}px`,
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                          borderLeft: !index ? "none" : "",
                                                      }
                                                    : {
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                          borderLeft: !index ? "none" : "",
                                                      },
                                            },
                                        }}
                                    />
                                );
                            })}

                            {activeColumns.map(({ field, header }: TableColumnsList, index) => {
                                const savedWidth = serverSettings?.contacts?.columnWidth?.[field];

                                return (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        headerClassName='cursor-move'
                                        body={bodyDataRender(field)}
                                        pt={{
                                            root: {
                                                style: savedWidth
                                                    ? {
                                                          width: `${savedWidth}px`,
                                                          maxWidth: `${savedWidth}px`,
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                      }
                                                    : {
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                      },
                                            },
                                        }}
                                    />
                                );
                            })}
                        </DataTable>
                    )}
                </div>
            </div>
            <AdvancedSearchDialog<AdvancedSearch>
                visible={dialogVisible}
                buttonDisabled={buttonDisabled}
                onHide={() => {
                    setButtonDisabled(true);
                    setDialogVisible(false);
                }}
                action={handleAdvancedSearch}
                onSearchClear={handleClearAdvancedSearchField}
                onInputChange={handleSetAdvancedSearch}
                fields={searchFields}
                searchForm={SEARCH_FORM_TYPE.CONTACTS}
            />
        </div>
    );
};

export const Contacts = () => {
    return (
        <div className='card contacts'>
            <div className='card-header'>
                <h2 className='card-header__title uppercase m-0'>Contacts</h2>
            </div>
            <ContactsDataTable />
        </div>
    );
};
