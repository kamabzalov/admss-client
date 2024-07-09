import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import {
    addUserGroupList,
    deleteUserGroupList,
    getUserGroupList,
} from "http/services/auth-user.service";
import { UserGroup } from "common/models/user";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { Loader } from "dashboard/common/loader";
import { BaseResponseError, Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";

const NEW_ITEM = "new";

export const SettingsInventoryGroups = (): ReactElement => {
    const toast = useToast();
    const store = useStore().userStore;
    const { authUser } = store;

    const [inventorySettings, setInventorySettings] = useState<Partial<UserGroup>[]>([]);
    const [editedItem, setEditedItem] = useState<Partial<UserGroup>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleGetUserGroupList = () => {
        if (authUser) {
            getUserGroupList(authUser.useruid).then((list) => {
                list && setInventorySettings(list);
                setIsLoading(false);
            });
        }
    };

    useEffect(() => {
        handleGetUserGroupList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMoveItem = (currentItem: UserGroup, direction: "up" | "down") => {
        if (currentItem) {
            setIsLoading(true);
            const order = direction === "up" ? --currentItem.order : ++currentItem.order;
            addUserGroupList(authUser!.useruid, {
                ...currentItem,
                order,
            }).then(handleGetUserGroupList);
        }
    };

    const handleSetGroupDefault = (item: UserGroup) => {
        if (item) {
            setIsLoading(true);

            if (!item.enabled) {
                return setIsLoading(false);
            }

            addUserGroupList(authUser!.useruid, {
                ...item,
                isdefault: !!item.isdefault ? 0 : 1,
            }).then(handleGetUserGroupList);
        }
    };

    const handleSaveGroup = () => {
        setIsLoading(true);
        addUserGroupList(authUser!.useruid, {
            description: editedItem.description,
            itemuid: editedItem.itemuid === NEW_ITEM ? undefined : editedItem.itemuid,
        }).then((response) => {
            if (response?.status === Status.ERROR) {
                const { error, status } = response as BaseResponseError;
                toast.current?.show({
                    severity: "error",
                    summary: status,
                    detail: error,
                    life: TOAST_LIFETIME,
                });
                return setIsLoading(false);
            }
            getUserGroupList(authUser!.useruid).then((list) => {
                list && setInventorySettings(list);
                setEditedItem({});
                setIsLoading(false);
            });
        });
    };

    const handleToggleGroupVisible = (item: UserGroup) => {
        setIsLoading(true);
        addUserGroupList(authUser!.useruid, {
            enabled: !item.enabled ? 1 : 0,
            itemuid: item.itemuid,
            description: item.description,
        }).then(handleGetUserGroupList);
    };

    const handleDeleteGroup = (item: UserGroup) => {
        setIsLoading(true);
        item.itemuid &&
            deleteUserGroupList(item.itemuid).then(() => {
                getUserGroupList(authUser!.useruid).then((list) => {
                    list && setInventorySettings(list);
                    setIsLoading(false);
                });
            });
    };

    const handleCheckAllGroups = ({ checked }: CheckboxChangeEvent) => {
        setIsLoading(true);
        inventorySettings.forEach((item, index) => {
            if (!index) return;
            addUserGroupList(authUser!.useruid, {
                enabled: checked ? 1 : 0,
                itemuid: item.itemuid,
                description: item.description,
            }).then(() => {
                getUserGroupList(authUser!.useruid)
                    .then((list) => {
                        list && setInventorySettings(list);
                        setIsLoading(false);
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            });
        });
        setIsLoading(false);
    };

    return (
        <div className='settings-form'>
            {isLoading && <Loader overlay />}
            <div className='settings-form__title'>Inventory groups</div>
            <div className='flex justify-content-end mb-4'>
                <Button
                    className='settings-form__button'
                    outlined
                    onClick={() => {
                        setEditedItem({
                            description: "",
                            itemuid: NEW_ITEM,
                        });
                        setInventorySettings([
                            ...inventorySettings,
                            {
                                description: "",
                                itemuid: NEW_ITEM,
                            },
                        ]);
                    }}
                >
                    New Group
                </Button>
            </div>
            <div className='grid settings-inventory p-2'>
                <div className='col-12'>
                    <div className='settings-inventory__header grid'>
                        <div className='col-1'></div>
                        <div className='col-1 flex justify-content-center align-items-center'>
                            <Checkbox
                                checked={inventorySettings.every((item) => item.enabled)}
                                onChange={handleCheckAllGroups}
                            />
                        </div>
                        <div className='col-7 flex align-items-center'>Group</div>
                        <div className='col-3 flex align-items-center p-0'>Actions</div>
                    </div>
                    <div className='settings-inventory__body grid'>
                        {inventorySettings.map((item, index) => (
                            <div key={item.itemuid} className='settings-inventory__row grid col-12'>
                                <div className='col-1 group-order'>
                                    <Button
                                        icon='pi pi-arrow-circle-up'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move up'
                                        className='p-button-text group-order__button'
                                        onClick={() => handleMoveItem(item as UserGroup, "up")}
                                        disabled={index === 0 || item.itemuid === NEW_ITEM}
                                    />
                                    <Button
                                        icon='pi pi-arrow-circle-down'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move down'
                                        className='p-button-text group-order__button'
                                        onClick={() => handleMoveItem(item as UserGroup, "down")}
                                        disabled={
                                            index === inventorySettings.length - 1 ||
                                            item.itemuid === NEW_ITEM
                                        }
                                    />
                                </div>
                                <div className='col-1 flex justify-content-center align-items-center'>
                                    <Checkbox
                                        checked={!!item.enabled}
                                        tooltip='Select visible inventory groups'
                                        onClick={() => handleToggleGroupVisible(item as UserGroup)}
                                    />
                                </div>
                                <div className='col-7 flex align-items-center'>
                                    {editedItem.itemuid === item.itemuid ? (
                                        <div className='flex row-edit'>
                                            <InputText
                                                type='text'
                                                value={editedItem.description}
                                                className='row-edit__input'
                                                onChange={(e) => {
                                                    setEditedItem({
                                                        ...editedItem,
                                                        description: e.target.value,
                                                    });
                                                }}
                                            />
                                            <Button
                                                className='p-button row-edit__button'
                                                onClick={handleSaveGroup}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    ) : (
                                        item.description
                                    )}
                                </div>
                                <div className='col-3 flex align-items-center column-gap-3'>
                                    <Button
                                        className='p-button'
                                        icon={`pi pi-star${!!item.isdefault ? "-fill" : ""}`}
                                        tooltip='Make default'
                                        outlined
                                        disabled={!item.enabled}
                                        severity={!item.isdefault ? "secondary" : "success"}
                                        onClick={() => handleSetGroupDefault(item as UserGroup)}
                                    />
                                    <Button
                                        className='p-button'
                                        outlined
                                        onClick={() => {
                                            editedItem.itemuid
                                                ? setEditedItem({})
                                                : setEditedItem(item);
                                        }}
                                        disabled={!item.useruid}
                                        severity={!item.useruid ? "secondary" : "success"}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className='p-button settings-inventory__delete'
                                        outlined
                                        disabled={!!item.isdefault || !item.useruid}
                                        severity={
                                            !!item.isdefault || !item.useruid
                                                ? "secondary"
                                                : "danger"
                                        }
                                        onClick={() => handleDeleteGroup(item as UserGroup)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
