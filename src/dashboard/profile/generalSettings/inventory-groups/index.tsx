import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import {
    addUserGroupList,
    deleteUserGroupList,
    getUserGroupList,
} from "http/services/auth-user.service";
import { UserGroup } from "common/models/user";
import { Checkbox } from "primereact/checkbox";
import { Loader } from "dashboard/common/loader";

export const SettingsInventoryGroups = (): ReactElement => {
    const [inventorySettings, setInventorySettings] = useState<Partial<UserGroup>[]>([]);
    const [editedItem, setEditedItem] = useState<Partial<UserGroup>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getUserGroupList(authUser.useruid).then((list) => {
                list && setInventorySettings(list);
            });
        }
    }, []);

    const moveItem = (item: Partial<UserGroup>, direction: "up" | "down") => {
        const currentItemIndex = inventorySettings.find(({ itemuid }) => itemuid === item.itemuid);

        if (currentItemIndex) {
            const order =
                direction === "up" ? currentItemIndex.order! - 1 : currentItemIndex.order! + 1;
            addUserGroupList(getKeyValue(LS_APP_USER).useruid, { ...currentItemIndex, order }).then(
                () => {
                    getUserGroupList(getKeyValue(LS_APP_USER).useruid).then((list) => {
                        list && setInventorySettings(list);
                        setIsLoading(false);
                    });
                }
            );
        }
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
                            itemuid: "new",
                        });
                        setInventorySettings([
                            ...inventorySettings,
                            {
                                description: "",
                                itemuid: "new",
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
                                onChange={({ checked }) => {
                                    setIsLoading(true);
                                    inventorySettings.forEach((item, index) => {
                                        if (!index) return;
                                        addUserGroupList(getKeyValue(LS_APP_USER).useruid, {
                                            enabled: checked ? 1 : 0,
                                            itemuid: item.itemuid,
                                            description: item.description,
                                        }).then(() => {
                                            getUserGroupList(getKeyValue(LS_APP_USER).useruid)
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
                                }}
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
                                        onClick={() => moveItem(item, "up")}
                                        disabled={index === 0}
                                    />
                                    <Button
                                        icon='pi pi-arrow-circle-down'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move down'
                                        className='p-button-text group-order__button'
                                        onClick={() => moveItem(item, "down")}
                                        disabled={index === inventorySettings.length - 1}
                                    />
                                </div>
                                <div className='col-1 flex justify-content-center align-items-center'>
                                    <Checkbox
                                        checked={!!item.enabled}
                                        tooltip='Select visible inventory groups'
                                        disabled={inventorySettings[0].itemuid === item.itemuid}
                                        onClick={() => {
                                            if (inventorySettings[0].itemuid === item.itemuid)
                                                return;
                                            setIsLoading(true);
                                            addUserGroupList(getKeyValue(LS_APP_USER).useruid, {
                                                enabled: !item.enabled ? 1 : 0,
                                                itemuid: item.itemuid,
                                                description: item.description,
                                            }).then(() => {
                                                getUserGroupList(
                                                    getKeyValue(LS_APP_USER).useruid
                                                ).then((list) => {
                                                    list && setInventorySettings(list);
                                                    setIsLoading(false);
                                                });
                                            });
                                        }}
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
                                                onClick={() => {
                                                    setIsLoading(true);
                                                    addUserGroupList(
                                                        getKeyValue(LS_APP_USER).useruid,
                                                        {
                                                            description: editedItem.description,
                                                            itemuid:
                                                                editedItem.itemuid === "new"
                                                                    ? undefined
                                                                    : editedItem.itemuid,
                                                        }
                                                    ).then(() => {
                                                        getUserGroupList(
                                                            getKeyValue(LS_APP_USER).useruid
                                                        ).then((list) => {
                                                            list && setInventorySettings(list);
                                                            setEditedItem({});
                                                            setIsLoading(false);
                                                        });
                                                    });
                                                }}
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
                                        icon='pi pi-star'
                                        outlined
                                        severity={
                                            inventorySettings[0].itemuid === item.itemuid
                                                ? "secondary"
                                                : "success"
                                        }
                                    />
                                    <Button
                                        className='p-button'
                                        outlined
                                        disabled={inventorySettings[0].itemuid === item.itemuid}
                                        severity={
                                            inventorySettings[0].itemuid === item.itemuid
                                                ? "secondary"
                                                : "success"
                                        }
                                        onClick={() => {
                                            editedItem.itemuid
                                                ? setEditedItem({})
                                                : setEditedItem(item);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className='p-button settings-inventory__delete'
                                        outlined
                                        disabled={inventorySettings[0].itemuid === item.itemuid}
                                        severity={
                                            inventorySettings[0].itemuid === item.itemuid
                                                ? "secondary"
                                                : "danger"
                                        }
                                        onClick={() => {
                                            setIsLoading(true);
                                            item.itemuid &&
                                                deleteUserGroupList(item.itemuid).then(() => {
                                                    getUserGroupList(
                                                        getKeyValue(LS_APP_USER).useruid
                                                    ).then((list) => {
                                                        list && setInventorySettings(list);
                                                        setIsLoading(false);
                                                    });
                                                });
                                        }}
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
