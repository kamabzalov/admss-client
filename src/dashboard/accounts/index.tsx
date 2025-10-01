import { ReactElement, useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";

import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { getAccountsList, TotalAccountList } from "http/services/accounts.service";
import { Column } from "primereact/column";
import { QueryParams } from "common/models/query-params";
import { ROWS_PER_PAGE } from "common/settings";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { AccountInfo } from "common/models/accounts";
import AccountsHeader from "dashboard/accounts/components/AccountsHeader";
import AccountsAdvancedSearch from "dashboard/accounts/components/AccountsAdvancedSearch";
import { useCreateReport } from "common/hooks";
import { columns, TableColumnsList } from "dashboard/accounts/common/data-table";
import { ACCOUNTS_PAGE } from "common/constants/links";
import { Button } from "primereact/button";
import { AccountsUserSettings } from "common/models/user";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";

interface AccountsDataTableProps {
    onRowClick?: (accountName: string) => void;
    returnedField?: keyof AccountInfo;
    getFullInfo?: (account: AccountInfo) => void;
}

export const AccountsDataTable = observer(
    ({ onRowClick, returnedField, getFullInfo }: AccountsDataTableProps): ReactElement => {
        const [accounts, setAccounts] = useState<AccountInfo[]>([]);
        const userStore = useStore().userStore;
        const { authUser } = userStore;
        const [totalRecords, setTotalRecords] = useState<number>(0);
        const [globalSearch, setGlobalSearch] = useState<string>("");
        const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
        const [dialogVisible, setDialogVisible] = useState<boolean>(false);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [selectedAccountType, setSelectedAccountType] = useState<string>("");
        const { activeColumns, setActiveColumnsAndSave } = useUserProfileSettings<
            AccountsUserSettings,
            TableColumnsList
        >("accounts", columns);
        const navigate = useNavigate();
        const { createReport } = useCreateReport<AccountInfo>();

        const printTableData = async (print: boolean = false) => {
            if (!authUser) return;

            setIsLoading(true);
            try {
                await createReport({
                    userId: authUser.useruid,
                    items: accounts,
                    columns: activeColumns.map((column) => ({
                        field: column.field as keyof AccountInfo,
                        header: String(column.header),
                    })),
                    widths: [],
                    print,
                    name: "accounts",
                });
            } finally {
                setIsLoading(false);
            }
        };

        const pageChanged = (event: DataTablePageEvent) => {
            setLazyState(event);
        };

        const sortData = (event: DataTableSortEvent) => {
            setLazyState(event);
        };

        useEffect(() => {
            getAccountsList(authUser!.useruid, { total: 1 }).then((response) => {
                if (response && !Array.isArray(response)) {
                    const { total } = response as TotalAccountList;
                    setTotalRecords(total ?? 0);
                }
            });
        }, []);

        useEffect(() => {
            const params: QueryParams & { accounttype?: string } = {
                ...(lazyState.sortField && { column: lazyState.sortField }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            let qry: string = "";
            if (selectedAccountType) {
                params.accounttype = selectedAccountType;
            }
            if (globalSearch) {
                qry += globalSearch;
            }
            if (qry.length) {
                params.qry = qry;
            }
            if (authUser) {
                getAccountsList(authUser.useruid, params).then((response) => {
                    if (Array.isArray(response)) {
                        setAccounts(response);
                    } else {
                        setAccounts([]);
                    }
                });
            }
        }, [lazyState, authUser, globalSearch, selectedAccountType]);

        const handleOnRowClick = ({ data }: DataTableRowClickEvent): void => {
            const selectedText = window.getSelection()?.toString();

            if (!!selectedText?.length) {
                return;
            }
            if (getFullInfo) {
                getFullInfo(data as AccountInfo);
            }
            if (onRowClick) {
                const value = returnedField ? data[returnedField] : data.name;
                onRowClick(value);
            } else {
                navigate(data.accountuid);
            }
        };

        return (
            <div className='card-content'>
                <AccountsHeader
                    searchValue={globalSearch}
                    onSearchChange={setGlobalSearch}
                    onAdvancedSearch={() => setDialogVisible(true)}
                    onPrint={() => printTableData(true)}
                    onDownload={() => printTableData()}
                    isLoading={isLoading}
                    availableColumns={columns}
                    activeColumns={activeColumns}
                    onActiveColumnsChange={(nextColumns: TableColumnsList[]) => {
                        setActiveColumnsAndSave(nextColumns);
                    }}
                    selectedAccountType={selectedAccountType}
                    onAccountTypeChange={setSelectedAccountType}
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
                                value={accounts}
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
                                onRowClick={handleOnRowClick}
                            >
                                <Column
                                    bodyStyle={{ textAlign: "center" }}
                                    reorderable={false}
                                    resizeable={false}
                                    body={({ accountuid }: AccountInfo) => {
                                        return (
                                            <Button
                                                text
                                                className='table-edit-button'
                                                icon='adms-edit-item'
                                                tooltip='Edit account'
                                                tooltipOptions={{ position: "mouse" }}
                                                onClick={() =>
                                                    navigate(ACCOUNTS_PAGE.EDIT(accountuid))
                                                }
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

                                {activeColumns.map(({ field, header }: TableColumnsList) => (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        headerClassName='cursor-move'
                                    />
                                ))}
                            </DataTable>
                        )}
                    </div>
                </div>
                <AccountsAdvancedSearch
                    visible={dialogVisible}
                    onClose={() => setDialogVisible(false)}
                    onAccountsUpdate={setAccounts}
                    lazyState={lazyState}
                />
            </div>
        );
    }
);

export const Accounts = () => {
    return (
        <div className='card accounts'>
            <div className='card-header'>
                <h2 className='card-header__title uppercase m-0'>Accounts</h2>
            </div>
            <AccountsDataTable />
        </div>
    );
};
