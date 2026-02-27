import { ReactElement, useEffect, useRef, useState } from "react";
import { DataTable, DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { disableUser, enableUser, getSubUsersList } from "http/services/users";
import { SubUser } from "common/models/users";
import { QueryParams } from "common/models/query-params";
import { Column } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { Button } from "primereact/button";
import { ROWS_PER_PAGE } from "common/settings";
import { useCreateReport, useToastMessage } from "common/hooks";
import { Loader } from "dashboard/common/loader";
import { USERS_PAGE } from "common/constants/links";
import UsersHeader from "dashboard/profile/users/components/UsersHeader";
import "./index.css";
import { SwitchButton } from "dashboard/common/button";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { TruncatedText } from "dashboard/common/display";
import { UsersUserSettings } from "common/models/user";
import { DataTableColumnResizeEndEvent } from "primereact/datatable";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";

const PAGINATOR_HEIGHT = 86;
const TABLE_HEIGHT = `calc(100% - ${PAGINATOR_HEIGHT}px)`;

enum USER_MODAL_MESSAGE {
    TITLE_ENABLED = "Enable user?",
    TITLE_DISABLED = "Disable user?",
    ENABLED = "Are you sure you want to enable this user?",
    DISABLED = "Are you sure you want to disable this user?",
}

export const Users = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [subUsers, setSubUsers] = useState<SubUser[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const dataTableRef = useRef<DataTable<SubUser[]>>(null);
    const [columnWidths, setColumnWidths] = useState<{ field: string; width: number }[]>([]);
    const { serverSettings, setModuleSettings } = useUserProfileSettings<
        UsersUserSettings,
        { field: string; header?: unknown }
    >("users", [
        { field: "username", header: "User name" },
        { field: "rolename", header: "Role" },
    ]);
    const { showError } = useToastMessage();
    const { createReport } = useCreateReport<SubUser>();
    const navigate = useNavigate();
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<SubUser | null>(null);

    const handleGetUsers = async (params?: QueryParams) => {
        if (!authUser) return;
        setIsLoading(true);
        const response = await getSubUsersList(authUser.useruid, params);

        if (response && Array.isArray(response)) {
            setSubUsers(response);
            setTotalRecords(response.length);
        } else {
            showError(response?.error);
        }
        setIsLoading(false);
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
    }, [subUsers]);

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    const handleColumnResize = (event: DataTableColumnResizeEndEvent) => {
        if (event.column.props.field) {
            const newColumnWidth = {
                [event.column.props.field as string]: event.element.offsetWidth,
            };
            setModuleSettings({
                columnWidth: {
                    ...serverSettings?.users?.columnWidth,
                    ...newColumnWidth,
                },
            });
        }
    };

    const handleAddNewUser = () => {
        navigate(USERS_PAGE.CREATE());
    };

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        await createReport({
            userId: authUser.useruid,
            items: subUsers,
            columns: [
                { field: "username" as keyof SubUser, header: "User Name" },
                { field: "rolename" as keyof SubUser, header: "Role" },
            ],
            widths: columnWidths,
            print,
            name: "users",
        });
    };

    const switchUserEnabled = async (user: SubUser) => {
        if (!user.useruid) return;
        if (user.enabled) {
            await disableUser(user.useruid);
        } else {
            await enableUser(user.useruid);
        }
        await handleGetUsers();
    };

    const openConfirmToggle = (user: SubUser) => {
        setSelectedUser(user);
        setConfirmVisible(true);
    };

    const closeConfirm = () => {
        setConfirmVisible(false);
        setSelectedUser(null);
    };

    const userNameColumn = (data: SubUser) => {
        return (
            <TruncatedText
                className={`${!data.enabled ? "users-table-row--disabled" : ""}`}
                withTooltip={true}
                tooltipOptions={{
                    position: "mouse",
                    content: data.username,
                }}
                data-field='username'
                text={data.username}
            />
        );
    };

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card users data-table-wrapper'>
                    <div className='card-header'>
                        <h2 className='card-header__title users__title uppercase m-0'>Users</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12'>
                                <UsersHeader
                                    searchValue={globalSearch}
                                    onSearchChange={(nextValue: string) =>
                                        setGlobalSearch(nextValue)
                                    }
                                    onAddNew={handleAddNewUser}
                                    onPrint={() => printTableData(true)}
                                    onDownload={() => printTableData(false)}
                                />
                            </div>
                            <div className='col-12'>
                                {isLoading ? (
                                    <div className='dashboard-loader__wrapper'>
                                        <Loader />
                                    </div>
                                ) : (
                                    <DataTable
                                        ref={dataTableRef}
                                        showGridlines
                                        value={subUsers}
                                        lazy
                                        paginator
                                        scrollable
                                        scrollHeight='70vh'
                                        first={lazyState.first}
                                        rows={lazyState.rows}
                                        rowsPerPageOptions={ROWS_PER_PAGE}
                                        className='users-table'
                                        totalRecords={totalRecords || 1}
                                        onPage={pageChanged}
                                        onSort={sortData}
                                        sortOrder={lazyState.sortOrder}
                                        sortField={lazyState.sortField}
                                        resizableColumns
                                        onColumnResizeEnd={handleColumnResize}
                                        rowClassName={() =>
                                            "hover:text-primary cursor-pointer users-table-row"
                                        }
                                        pt={{
                                            resizeHelper: {
                                                style: {
                                                    maxHeight: TABLE_HEIGHT,
                                                },
                                            },
                                        }}
                                    >
                                        <Column
                                            bodyStyle={{ textAlign: "center" }}
                                            resizeable={false}
                                            body={({ useruid }: SubUser) => {
                                                return (
                                                    <Button
                                                        text
                                                        className='table-edit-button'
                                                        icon='adms-edit-item'
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
                                                        width: "40px",
                                                    },
                                                },
                                            }}
                                        />
                                        <Column
                                            field='username'
                                            header='User name'
                                            sortable
                                            body={userNameColumn}
                                            pt={{
                                                root: {
                                                    style: {
                                                        width: serverSettings?.users?.columnWidth?.[
                                                            "username"
                                                        ],
                                                        maxWidth:
                                                            serverSettings?.users?.columnWidth?.[
                                                                "username"
                                                            ],
                                                    },
                                                },
                                            }}
                                        />
                                        <Column
                                            field='rolename'
                                            header='Role'
                                            sortable
                                            resizeable={false}
                                            body={(data: SubUser) => {
                                                return (
                                                    <span
                                                        className={`${!data.enabled ? "users-table-row--disabled" : ""}`}
                                                        data-field='rolename'
                                                    >
                                                        {data.rolename}
                                                    </span>
                                                );
                                            }}
                                            pt={{
                                                root: {
                                                    style: {
                                                        width: serverSettings?.users?.columnWidth?.[
                                                            "rolename"
                                                        ],
                                                        maxWidth:
                                                            serverSettings?.users?.columnWidth?.[
                                                                "rolename"
                                                            ],
                                                    },
                                                },
                                            }}
                                        />
                                        <Column
                                            bodyStyle={{ textAlign: "center" }}
                                            body={(data: SubUser) => {
                                                return (
                                                    <SwitchButton
                                                        checked={!!data?.enabled}
                                                        tooltip={
                                                            data.enabled ? "Disable" : "Enable"
                                                        }
                                                        tooltipOptions={{ position: "mouse" }}
                                                        onChange={() => {
                                                            openConfirmToggle(data);
                                                        }}
                                                    />
                                                );
                                            }}
                                            pt={{
                                                root: {
                                                    className: "border-left-none",
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
            {selectedUser ? (
                <ConfirmModal
                    visible={confirmVisible}
                    onHide={closeConfirm}
                    icon='adms-warning'
                    title={
                        selectedUser.enabled
                            ? USER_MODAL_MESSAGE.TITLE_DISABLED
                            : USER_MODAL_MESSAGE.TITLE_ENABLED
                    }
                    bodyMessage={
                        selectedUser.enabled
                            ? USER_MODAL_MESSAGE.DISABLED
                            : USER_MODAL_MESSAGE.ENABLED
                    }
                    confirmAction={() => {
                        switchUserEnabled(selectedUser);
                    }}
                    rejectAction={closeConfirm}
                    rejectLabel='Cancel'
                    acceptLabel='Confirm'
                    className='users-confirm-dialog'
                />
            ) : null}
        </div>
    );
});
