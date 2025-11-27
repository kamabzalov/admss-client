import { ReactElement, useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { DataTable, DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import AuditHeader from "./components/AuditHeader";
import { useCreateReport, useToastMessage } from "common/hooks";
import { AuditRecord, getAccountAudit } from "http/services/accounts.service";
import { AccountsAuditUserSettings, ServerUserSettings } from "common/models/user";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";

const columns = [
    { field: "name", header: "Account" },
    { field: "accountnumber", header: "Line#" },
    { field: "accounttype", header: "User" },
    { field: "created", header: "Date" },
    { field: "startingballance", header: "Debit" },
    { field: "downpayment", header: "Credit" },
];

export const AccountsAudit = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { showError } = useToastMessage();
    const [totalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [isLoading] = useState<boolean>(false);
    const { createReport } = useCreateReport<AuditRecord>();
    const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();

    const getAuditRecords = async () => {
        if (!authUser) return;
        const response = await getAccountAudit(authUser.useruid);
        if (Array.isArray(response)) {
            setAuditRecords(response);
        } else {
            setAuditRecords([]);
            showError(response?.error);
        }
    };

    useEffect(() => {
        getAuditRecords();
    }, []);

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;

        await createReport({
            userId: authUser.useruid,
            items: auditRecords,
            columns: columns.map((column) => ({
                field: column.field as keyof AuditRecord,
                header: String(column.header),
            })),
            widths: [],
            print,
            name: "accounts-audit",
        });
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    const changeSettings = (settings: Partial<AccountsAuditUserSettings>) => {
        if (authUser) {
            const newSettings = {
                ...serverSettings,
                accountsAudit: { ...serverSettings?.accountsAudit, ...settings },
            } as ServerUserSettings;
            setServerSettings(newSettings);
            setUserSettings(authUser.useruid, newSettings);
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            if (authUser) {
                const response = await getUserSettings(authUser.useruid);
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
                }
            }
        };

        loadSettings();
    }, [authUser]);

    return (
        <div className='card-content'>
            <AuditHeader
                searchValue={globalSearch}
                onSearchChange={setGlobalSearch}
                onPrint={() => printTableData(true)}
                onDownload={() => printTableData()}
                isLoading={isLoading}
                selectedAccountType={""}
                onAccountTypeChange={() => {}}
            />
            <div className='grid'>
                <div className='col-12'>
                    {isLoading ? (
                        <div className='dashboard-loader__wrapper'>
                            <Loader overlay />
                        </div>
                    ) : (
                        <DataTable
                            showGridlines
                            value={auditRecords}
                            lazy
                            paginator
                            first={lazyState.first}
                            rows={lazyState.rows}
                            rowsPerPageOptions={ROWS_PER_PAGE}
                            totalRecords={totalRecords || 1}
                            onPage={pageChanged}
                            onSort={sortData}
                            reorderableColumns
                            resizableColumns
                            sortOrder={lazyState.sortOrder}
                            sortField={lazyState.sortField}
                            rowClassName={() => "hover:text-primary cursor-pointer"}
                            emptyMessage='No data selected to display. Please use the filter field to select the necessary data table.'
                            onColumnResizeEnd={(event) => {
                                if (authUser && event) {
                                    const newColumnWidth = {
                                        [event.column?.props?.field as string]:
                                            event.element?.offsetWidth,
                                    };
                                    changeSettings({
                                        columnWidth: {
                                            ...serverSettings?.accountsAudit?.columnWidth,
                                            ...newColumnWidth,
                                        },
                                    });
                                }
                            }}
                        >
                            {columns.map(({ field, header }) => {
                                const savedWidth =
                                    serverSettings?.accountsAudit?.columnWidth?.[field];

                                return (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        headerClassName='cursor-move'
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
        </div>
    );
});
