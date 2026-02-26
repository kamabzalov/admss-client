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
import { DateFormat, DateReturnType, DateSeparator, parseDateFromServer } from "common/helpers";

export type UserRoleColumnProps = Omit<ColumnProps, "field"> & {
    field?: keyof UserRole;
};

export const UserRoleColumn = (props: UserRoleColumnProps) => <Column {...props} />;

enum USER_ROLE_MODAL_MESSAGE {
    COPY_ROLE = "Do you really want to duplicate this role?",
    COPY_ROLE_SUCCESS = "Role is successfully duplicated!",
    DELETE_ROLE = "Do you really want to delete this role? This process cannot be undone.",
    DELETE_ROLE_SUCCESS = "Role is successfully deleted!",
}

export const UsersRoles = observer((): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const dataTableRef = useRef<DataTable<UserRole[]>>(null);
    const { showError, showSuccess } = useToastMessage();
    const navigate = useNavigate();
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    const handleGetUserRoles = async (withLoading: boolean = true) => {
        if (!authUser) return;
        if (withLoading) setIsLoading(true);
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
            handleGetUserRoles(false);
            showSuccess(USER_ROLE_MODAL_MESSAGE.COPY_ROLE_SUCCESS);
        }
    };

    const executeDeleteUserRole = async (data: UserRole) => {
        const response = await deleteUserRole(data.roleuid);
        if (response && response.error) {
            showError(response?.error);
        } else {
            handleGetUserRoles(false);
            showSuccess(USER_ROLE_MODAL_MESSAGE.DELETE_ROLE_SUCCESS);
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
        <div className='settings-form roles-settings-form'>
            {isLoading && <Loader overlay />}
            <div className='settings-form__title'>Roles</div>
            <div className='flex justify-content-end mb-4'>
                <Button className='settings-form__button' onClick={handleAddNewUserRole}>
                    New Role
                </Button>
            </div>
            <div className='roles-table-container'>
                <DataTable
                    ref={dataTableRef}
                    showGridlines
                    value={userRoles}
                    scrollable
                    scrollHeight='flex'
                    className='roles-table'
                    rowClassName={() => "hover:text-primary cursor-pointer roles-table-row"}
                    tableStyle={{ tableLayout: "fixed", width: "100%" }}
                    pt={{
                        wrapper: {
                            className: "thin-scrollbar",
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
                    <UserRoleColumn
                        field='created'
                        header='Date'
                        body={(data: UserRole) => {
                            return (
                                <span>
                                    {parseDateFromServer(data.created, {
                                        returnType: DateReturnType.DATE,
                                        separator: DateSeparator.SLASH,
                                        format: DateFormat.MM_DD_YYYY,
                                    })}
                                </span>
                            );
                        }}
                        style={{ width: "30%" }}
                    />
                    <UserRoleColumn
                        bodyStyle={{ textAlign: "center" }}
                        body={(data: UserRole) => {
                            return (
                                <div className='roles-table-row__buttons'>
                                    <Button
                                        text
                                        className='table-copy-button'
                                        disabled={!!data.isDefault}
                                        icon='adms-copy'
                                        tooltip='Duplicate role'
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
                                </div>
                            );
                        }}
                        pt={{
                            root: {
                                className: "border-left-none",
                                style: {
                                    width: "60px",
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
                    icon='adms-error'
                    title={`Are you sure?`}
                    bodyMessage={confirmMessage}
                    confirmAction={confirmAction}
                    rejectAction={() => setConfirmVisible(false)}
                    rejectLabel='Cancel'
                    acceptLabel='OK'
                    className='roles-confirm-dialog'
                />
            ) : null}
        </div>
    );
});
