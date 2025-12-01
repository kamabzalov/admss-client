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
import { AccountsAuditUserSettings } from "common/models/user";
import { ACCOUNT_AUDIT_TYPES } from "common/constants/account-options";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { TableColumn } from "dashboard/common/filter";

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
    const { moduleSettings, setModuleSettings, saveColumnWidth, settingsLoaded } =
        useUserProfileSettings<AccountsAuditUserSettings, TableColumn>("accountsAudit", []);
    const [selectedAuditType, setSelectedAuditType] = useState<ACCOUNT_AUDIT_TYPES | undefined>(
        undefined
    );

    const getAuditRecords = async (type: ACCOUNT_AUDIT_TYPES) => {
        if (!authUser) return;
        const response = await getAccountAudit(type);
        if (Array.isArray(response)) {
            setAuditRecords(response);
        } else {
            setAuditRecords([]);
            showError(response?.error);
        }
    };

    useEffect(() => {
        if (settingsLoaded) {
            const typeToLoad =
                moduleSettings?.selectedAuditType ?? ACCOUNT_AUDIT_TYPES.ACTIVITY_FOR_TODAY;
            setSelectedAuditType(typeToLoad);
        }
    }, [settingsLoaded]);

    useEffect(() => {
        if (selectedAuditType !== undefined && authUser) {
            getAuditRecords(selectedAuditType);
        }
    }, [selectedAuditType, authUser]);

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

    const handleAuditTypeChange = (type: ACCOUNT_AUDIT_TYPES) => {
        setSelectedAuditType(type);
        setModuleSettings({ selectedAuditType: type });
    };

    return (
        <div className='card-content'>
            <AuditHeader
                searchValue={globalSearch}
                onSearchChange={setGlobalSearch}
                onPrint={() => printTableData(true)}
                onDownload={() => printTableData()}
                isLoading={isLoading}
                selectedAccountType={selectedAuditType}
                onAccountTypeChange={handleAuditTypeChange}
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
                                if (authUser && event && event.column?.props?.field) {
                                    saveColumnWidth(
                                        event.column.props.field as string,
                                        event.element?.offsetWidth || 0
                                    );
                                }
                            }}
                        >
                            {columns.map(({ field, header }) => {
                                const savedWidth = moduleSettings?.columnWidth?.[field];

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
