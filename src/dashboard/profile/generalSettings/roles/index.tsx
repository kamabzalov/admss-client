import { ReactElement, useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { copyUserRole, deleteUserRole, getUserRoles } from "http/services/users";
import { UserRole } from "common/models/users";
import { Column, ColumnProps } from "primereact/column";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { Button } from "primereact/button";
import { useToastMessage } from "common/hooks";
import { Loader } from "dashboard/common/loader";
import "./index.css";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { SETTINGS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";

export type UserRoleColumnProps = Omit<ColumnProps, "field"> & {
    field?: keyof UserRole;
};

export const UserRoleColumn = (props: UserRoleColumnProps) => <Column {...props} />;

const PAGINATOR_HEIGHT = 86;
const TABLE_HEIGHT = `calc(100% - ${PAGINATOR_HEIGHT}px)`;

enum USER_ROLE_MODAL_MESSAGE {
    COPY_ROLE = "Do you really want to copy this role?",
    DELETE_ROLE = "Do you really want to delete this role?",
}

export const UsersRoles = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dataTableRef = useRef<DataTable<UserRole[]>>(null);
    const { showError } = useToastMessage();
    const navigate = useNavigate();
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const handleGetUserRoles = async () => {
        if (!authUser) return;
        setIsLoading(true);
        const response = await getUserRoles(authUser.useruid);

        if (response && Array.isArray(response)) {
            setUserRoles(response);
        } else {
            showError(response?.error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        handleGetUserRoles();
    }, []);

    const handleAddNewUserRole = () => {
        navigate(SETTINGS_PAGE.ROLES_CREATE());
    };

    const roleNameColumn = (data: UserRole) => {
        return (
            <TruncatedText
                withTooltip={true}
                tooltipOptions={{
                    position: "mouse",
                    content: data.rolename,
                }}
                data-field='rolename'
                className='roles-table-row__rolename'
                text={data.rolename}
            />
        );
    };

    const executeCopyUserRole = async (data: UserRole) => {
        setConfirmVisible(false);
        const response = await copyUserRole(data.roleuid);
        if (response && response.error) {
            showError(response?.error);
        } else {
            handleGetUserRoles();
        }
    };

    const executeDeleteUserRole = async (data: UserRole) => {
        const response = await deleteUserRole(data.roleuid);
        if (response && response.error) {
            showError(response?.error);
        } else {
            handleGetUserRoles();
        }
        setConfirmVisible(false);
    };

    const handleCopyUserRole = (data: UserRole) => {
        setSelectedUserRole(data);
        setConfirmVisible(true);
        setConfirmMessage(USER_ROLE_MODAL_MESSAGE.COPY_ROLE);
        setConfirmAction(() => () => executeCopyUserRole(data));
    };

    const handleDeleteUserRole = (data: UserRole) => {
        setSelectedUserRole(data);
        setConfirmVisible(true);
        setConfirmMessage(USER_ROLE_MODAL_MESSAGE.DELETE_ROLE);
        setConfirmAction(() => () => executeDeleteUserRole(data));
    };

    return (
        <div className='settings-form'>
            {isLoading && <Loader overlay />}
            <div className='settings-form__title'>Roles</div>
            <div className='flex justify-content-end mb-4'>
                <Button className='settings-form__button' outlined onClick={handleAddNewUserRole}>
                    New Role
                </Button>
            </div>
            <div className='col-12'>
                <DataTable
                    ref={dataTableRef}
                    showGridlines
                    value={userRoles}
                    paginator
                    scrollable
                    rows={10}
                    className='roles-table'
                    rowClassName={() => "hover:text-primary cursor-pointer roles-table-row"}
                    tableStyle={{ tableLayout: "fixed", width: "100%" }}
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
                        body={({ roleuid, isDefault }: UserRole) => {
                            return (
                                <Button
                                    text
                                    className='table-edit-button'
                                    disabled={!!isDefault}
                                    severity={!!isDefault ? "secondary" : "success"}
                                    icon='adms-edit-item'
                                    tooltip='Edit role'
                                    tooltipOptions={{
                                        position: "mouse",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(SETTINGS_PAGE.ROLES_EDIT(roleuid));
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
                    <UserRoleColumn
                        field='rolename'
                        header='Role'
                        body={roleNameColumn}
                        className='roles-table-row__rolename'
                        style={{ width: "20%", maxWidth: "20%" }}
                    />
                    <UserRoleColumn
                        field='isDefault'
                        body={({ isDefault }: UserRole) => {
                            return <span>{isDefault ? "System" : null}</span>;
                        }}
                        header='Created By'
                        style={{ width: "30%" }}
                    />
                    <UserRoleColumn field='created' header='Date' style={{ width: "30%" }} />
                    <UserRoleColumn
                        bodyStyle={{ textAlign: "center" }}
                        body={(data: UserRole) => {
                            return (
                                <>
                                    <Button
                                        text
                                        className='table-copy-button'
                                        disabled={!!data.isDefault}
                                        icon='adms-copy'
                                        tooltip='Copy role'
                                        severity={!!data.isDefault ? "secondary" : "success"}
                                        tooltipOptions={{
                                            position: "mouse",
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyUserRole(data);
                                        }}
                                    />
                                    <Button
                                        text
                                        className='table-delete-button'
                                        disabled={!!data.isDefault}
                                        icon='adms-trash-can'
                                        tooltip='Delete role'
                                        severity={!!data.isDefault ? "secondary" : "danger"}
                                        tooltipOptions={{
                                            position: "mouse",
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteUserRole(data);
                                        }}
                                    />
                                </>
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
            </div>
            {selectedUserRole ? (
                <ConfirmModal
                    visible={confirmVisible}
                    onHide={() => setConfirmVisible(false)}
                    icon='adms-warning'
                    title={`Are you sure?`}
                    bodyMessage={confirmMessage}
                    confirmAction={confirmAction}
                    rejectAction={() => setConfirmVisible(false)}
                    rejectLabel='Cancel'
                    acceptLabel='Confirm'
                    className='users-confirm-dialog'
                />
            ) : null}
        </div>
    );
});
