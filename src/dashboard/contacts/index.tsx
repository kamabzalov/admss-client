import { useEffect, useState } from "react";
import {
    getContacts,
    getContactsAmount,
    getContactsTypeList,
} from "http/services/contacts-service";
import { AuthUser } from "http/services/auth.service";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { getKeyValue } from "services/local-storage.service";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnProps } from "primereact/column";
import { QueryParams } from "common/models/query-params";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { LS_APP_USER } from "common/constants/localStorage";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { ROWS_PER_PAGE } from "common/settings";
import { ContactType, ContactTypeNameList, ContactUser } from "common/models/contact";
import { ContactsUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { makeShortReports } from "http/services/reports.service";
import { ReportsColumn } from "common/models/reports";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";

interface TableColumnProps extends ColumnProps {
    field: keyof ContactUser | "fullName";
}

interface ContactsDataTableProps {
    onRowClick?: (companyName: string) => void;
    contactCategory?: ContactTypeNameList | string;
    originalPath?: string;
    returnedField?: keyof ContactUser;
    getFullInfo?: (contact: ContactUser) => void;
}

const renderColumnsData: TableColumnProps[] = [
    { field: "fullName", header: "Name" },
    { field: "phone1", header: "Work Phone" },
    { field: "phone2", header: "Home Phone" },
    { field: "streetAddress", header: "Address" },
    { field: "email1", header: "Email" },
    { field: "created", header: "Created" },
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
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [contacts, setUserContacts] = useState<ContactUser[]>([]);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [activeColumns, setActiveColumns] = useState<TableColumnProps[]>(renderColumnsData);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const store = useStore().contactStore;

    const printTableData = async (print: boolean = false) => {
        setIsLoading(true);
        const columns: ReportsColumn[] = renderColumnsData.map((column) => ({
            name: column.header as string,
            data: column.field as string,
        }));
        const date = new Date();
        const name = `contacts_${
            date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

        if (authUser) {
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
        }
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

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setUser(authUser);
            getContactsTypeList("0").then((response) => {
                if (response) {
                    const types = response as ContactType[];
                    if (types?.length) {
                        if (contactCategory) {
                            const category = types?.find((item) => item.name === contactCategory);
                            setSelectedCategory(category ?? null);
                        }
                        setCategories(types);
                    }
                }
            });
        }
    }, [contactCategory]);

    useEffect(() => {
        const params: QueryParams = {
            ...(selectedCategory?.id && { param: selectedCategory.id }),
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(globalSearch && { qry: globalSearch }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip: lazyState.first,
            top: lazyState.rows,
        };
        if (authUser) {
            if (!selectedCategory && contactCategory) {
                return;
            }
            setIsLoading(true);
            getContactsAmount(authUser.useruid, { ...params, total: 1 }).then((response) => {
                setTotalRecords(response?.total ?? 0);
            });
            getContacts(authUser.useruid, params)
                .then((response) => {
                    if (response?.length) {
                        setUserContacts(response);
                    } else {
                        setUserContacts([]);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [selectedCategory, lazyState, authUser, globalSearch, contactCategory]);

    useEffect(() => {
        if (authUser) {
            getUserSettings(authUser.useruid).then((response) => {
                if (response?.profile.length) {
                    let allSettings: ServerUserSettings = {} as ServerUserSettings;
                    if (response.profile) {
                        try {
                            allSettings = JSON.parse(response.profile);
                        } catch (error) {
                            allSettings = {} as ServerUserSettings;
                        }
                    }
                    setServerSettings(allSettings);
                    const { contacts: settings } = allSettings;
                    settings?.activeColumns &&
                        setActiveColumns(settings.activeColumns as TableColumnProps[]);
                    settings?.table &&
                        setLazyState({
                            first: settings.table.first || initialDataTableQueries.first,
                            rows: settings.table.rows || initialDataTableQueries.rows,
                            page: settings.table.page || initialDataTableQueries.page,
                            column: settings.table.column || initialDataTableQueries.column,
                            sortField:
                                settings.table.sortField || initialDataTableQueries.sortField,
                            sortOrder:
                                settings.table.sortOrder || initialDataTableQueries.sortOrder,
                        });
                }
            });
        }
    }, [authUser]);

    const changeSettings = (settings: Partial<ContactsUserSettings>) => {
        if (authUser) {
            const newSettings = {
                ...serverSettings,
                contacts: { ...serverSettings?.contacts, ...settings },
            } as ServerUserSettings;
            setServerSettings(newSettings);
            setUserSettings(authUser.useruid, newSettings);
        }
    };

    const handleOnRowClick = ({ data }: DataTableRowClickEvent) => {
        if (getFullInfo) {
            getFullInfo(data as ContactUser);
        }
        if (onRowClick) {
            const value = returnedField
                ? data[returnedField]
                : `${data.firstName} ${data.lastName}`;
            onRowClick(value);
        } else {
            navigate(data.contactuid);
        }
    };

    const renderFullName = (rowData: ContactUser) => {
        return `${rowData.firstName} ${rowData.lastName}`;
    };

    const handleCreateContact = () => {
        if (originalPath) {
            store.memoRoute = originalPath;
        }
        navigate("/dashboard/contacts/create");
    };

    return (
        <div className='card-content'>
            <div className='grid datatable-controls'>
                <div className='col-6'>
                    <div className='contact-top-controls'>
                        <Dropdown
                            value={selectedCategory}
                            onChange={(e) => {
                                if (contactCategory) return;
                                changeSettings({
                                    selectedCategoriesOptions: e.value,
                                });
                                setSelectedCategory(e.value);
                            }}
                            options={categories}
                            optionLabel='name'
                            editable
                            disabled={!!contactCategory}
                            placeholder='Select Category'
                            pt={{
                                wrapper: {
                                    style: {
                                        maxHeight: "500px",
                                    },
                                },
                            }}
                        />

                        <Button
                            className='contact-top-controls__button'
                            icon='pi pi-plus-circle'
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
                            icon='icon adms-blank'
                            tooltip='Download contacts form'
                            onClick={() => printTableData()}
                        />
                    </div>
                </div>
                <div className='col-6 text-right'>
                    <Button
                        className='contact-top-controls__button m-r-20px'
                        label='Advanced search'
                        severity='success'
                        type='button'
                    />
                    <span className='p-input-icon-right'>
                        <i className='pi pi-search' />
                        <InputText
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                        />
                    </span>
                </div>
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
                            totalRecords={totalRecords}
                            onPage={pageChanged}
                            onSort={sortData}
                            sortOrder={lazyState.sortOrder}
                            sortField={lazyState.sortField}
                            resizableColumns
                            reorderableColumns
                            rowClassName={() => "hover:text-primary cursor-pointer"}
                            onRowClick={handleOnRowClick}
                            onColReorder={(event) => {
                                if (authUser && Array.isArray(event.columns)) {
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
                                            (column): column is TableColumnProps => column !== null
                                        ) as TableColumnProps[];

                                    setActiveColumns(newActiveColumns);

                                    changeSettings({
                                        activeColumns: newActiveColumns,
                                    });
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
                            {activeColumns.map(({ field, header }) => (
                                <Column
                                    field={field}
                                    header={header}
                                    key={field}
                                    sortable
                                    headerClassName='cursor-move'
                                    body={field === "fullName" ? renderFullName : undefined}
                                    pt={{
                                        root: {
                                            style: {
                                                width: serverSettings?.contacts?.columnWidth?.[
                                                    field
                                                ],
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            },
                                        },
                                    }}
                                />
                            ))}
                        </DataTable>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Contacts() {
    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Contacts</h2>
                    </div>
                    <ContactsDataTable />
                </div>
            </div>
        </div>
    );
}
