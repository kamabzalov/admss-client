import { ReactElement, useEffect, useRef, useState } from "react";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import {
    getClientsList,
    getUsersList,
    getUserRoles,
    enableUser,
    disableUser,
} from "http/services/users";
import { User } from "common/models/users";
import { UserGroup } from "common/models/user";
import { QueryParams } from "common/models/query-params";
import { Column } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { Button } from "primereact/button";
import { ToggleButton } from "primereact/togglebutton";
import { ROWS_PER_PAGE } from "common/settings";
import { useCreateReport, useToastMessage } from "common/hooks";
import { Loader } from "dashboard/common/loader";
import { USERS_PAGE } from "common/constants/links";
import UsersHeader from "dashboard/profile/users/components/UsersHeader";
import "./index.css";

interface UsersWithRole extends User {
    role?: UserGroup;
}

export const Users = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [users, setUsers] = useState<UsersWithRole[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const dataTableRef = useRef<DataTable<UsersWithRole[]>>(null);
    const [columnWidths, setColumnWidths] = useState<{ field: string; width: number }[]>([]);
    const { showError, showSuccess } = useToastMessage();
    const { createReport } = useCreateReport<User>();
    const navigate = useNavigate();

    const handleGetUsers = async (params?: QueryParams) => {
        if (!authUser) return;

        setIsLoading(true);
        try {
            let response = await getUsersList(authUser.useruid, params);
            if (!response || !Array.isArray(response)) {
                response = await getClientsList(authUser.useruid, params);
            }

            if (response && Array.isArray(response)) {
                const usersWithRoles = await Promise.all(
                    response.map(async (user: User) => {
                        try {
                            const userRole = await getUserRoles(user.useruid);
                            return {
                                ...user,
                                role:
                                    Array.isArray(userRole) && !!userRole.length
                                        ? userRole[0]
                                        : undefined,
                            };
                        } catch {
                            return user;
                        }
                    })
                );

                setUsers(usersWithRoles);
                setTotalRecords(response.length);
            }
        } catch (error) {
            showError(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        handleGetUsers();
    }, []);

    useEffect(() => {
        if (dataTableRef.current) {
            const table = dataTableRef.current.getTable();
            const columns = table.querySelectorAll("th");
            const columnWidths = Array.from(columns).map((column, index) => {
                return {
                    field: `column_${index}`,
                    width: column.offsetWidth,
                };
            });
            setColumnWidths(columnWidths);
        }
    }, [users]);

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    const handleAddNewUser = () => {
        navigate(USERS_PAGE.CREATE());
    };

    const handleToggleUser = async (user: UsersWithRole) => {
        if (!authUser) return;

        try {
            const isEnabled = user.enabled === 1;
            if (isEnabled) {
                await disableUser(user.useruid);
            } else {
                await enableUser(user.useruid);
            }

            await handleGetUsers();

            showSuccess(`User ${isEnabled ? "disabled" : "enabled"} successfully`);
        } catch (error) {
            showError(String(error));
        }
    };

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        await createReport({
            userId: authUser.useruid,
            items: users,
            columns: [
                { field: "username" as keyof User, header: "User Name" },
                { field: "role" as keyof User, header: "Role" },
            ],
            widths: columnWidths,
            print,
            name: "users",
        });
    };

    const header = (
        <UsersHeader
            searchValue={globalSearch}
            onSearchChange={(nextValue: string) => setGlobalSearch(nextValue)}
            onAddNew={handleAddNewUser}
            onPrint={() => printTableData(true)}
            onDownload={() => printTableData(false)}
        />
    );

    const handleOnRowClick = ({ data }: DataTableRowClickEvent): void => {
        const selectedText = window.getSelection()?.toString();
        if (!!selectedText?.length) {
            return;
        }
        navigate(USERS_PAGE.EDIT(data.useruid));
    };

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card users'>
                    <div className='card-header'>
                        <h2 className='card-header__title users__title uppercase m-0'>Users</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12'>
                                {isLoading ? (
                                    <div className='dashboard-loader__wrapper'>
                                        <Loader />
                                    </div>
                                ) : (
                                    <DataTable
                                        ref={dataTableRef}
                                        showGridlines
                                        value={users}
                                        lazy
                                        paginator
                                        scrollable
                                        scrollHeight='70vh'
                                        first={lazyState.first}
                                        rows={lazyState.rows}
                                        rowsPerPageOptions={ROWS_PER_PAGE}
                                        totalRecords={totalRecords || 1}
                                        onPage={pageChanged}
                                        onSort={sortData}
                                        sortOrder={lazyState.sortOrder}
                                        sortField={lazyState.sortField}
                                        resizableColumns
                                        header={header}
                                        rowClassName={() => "hover:text-primary cursor-pointer"}
                                        onRowClick={handleOnRowClick}
                                    >
                                        <Column
                                            bodyStyle={{ textAlign: "center" }}
                                            resizeable={false}
                                            body={({ useruid }: UsersWithRole) => {
                                                return (
                                                    <Button
                                                        text
                                                        className='table-edit-button'
                                                        icon='pi pi-pencil'
                                                        tooltip='Edit user'
                                                        tooltipOptions={{ position: "mouse" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(USERS_PAGE.EDIT(useruid));
                                                        }}
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
                                        <Column
                                            field='username'
                                            header='User name'
                                            sortable
                                            body={(data: UsersWithRole) => {
                                                return (
                                                    <span data-field='username'>
                                                        {data.username}
                                                    </span>
                                                );
                                            }}
                                        />
                                        <Column
                                            field='role'
                                            header='Role'
                                            sortable
                                            body={(data: UsersWithRole) => {
                                                return data.role?.description || "No role";
                                            }}
                                        />
                                        <Column
                                            header=''
                                            bodyStyle={{ textAlign: "center" }}
                                            body={(data: UsersWithRole) => {
                                                return (
                                                    <ToggleButton
                                                        checked={data.enabled === 1}
                                                        onChange={() => {
                                                            handleToggleUser(data);
                                                        }}
                                                        onLabel='Enabled'
                                                        offLabel='Disabled'
                                                        onIcon='pi pi-check'
                                                        offIcon='pi pi-times'
                                                        className='w-8rem'
                                                    />
                                                );
                                            }}
                                            pt={{
                                                root: {
                                                    style: {
                                                        width: "120px",
                                                    },
                                                },
                                            }}
                                        />
                                    </DataTable>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
