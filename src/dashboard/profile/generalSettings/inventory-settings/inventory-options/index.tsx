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
import { BaseResponseError, Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";
import { getInventoryGroupOptions } from "http/services/inventory-service";
import { Dropdown } from "primereact/dropdown";
import { observer } from "mobx-react-lite";

const NEW_ITEM = "new";

export const SettingsInventoryOptions = observer((): ReactElement => {
    const toast = useToast();
    const userStore = useStore().userStore;
    const store = useStore().generalSettingsStore;
    const { authUser } = userStore;
    const { inventoryGroupID, inventoryGroups } = store;

    const [inventoryOptions, setInventoryOptions] = useState<Partial<UserGroup>[]>([]);
    const [editedItem, setEditedItem] = useState<Partial<UserGroup>>({});

    const handleGetInventoryOptionsGroupList = async () => {
        const response = await getInventoryGroupOptions(inventoryGroupID);
        if (response?.error && !Array.isArray(response)) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const options = response as unknown as UserGroup[];
            setInventoryOptions(options?.filter(Boolean));
        }
    };

    useEffect(() => {
        inventoryGroupID && handleGetInventoryOptionsGroupList();
    }, [inventoryGroupID]);

    const handleSaveGroup = () => {
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
            }
            getUserGroupList(authUser!.useruid).then((list) => {
                list && setInventoryOptions(list);
                setEditedItem({});
            });
        });
    };

    const handleDeleteGroup = (item: UserGroup) => {
        item.itemuid &&
            deleteUserGroupList(item.itemuid).then(() => {
                getUserGroupList(authUser!.useruid).then((list) => {
                    list && setInventoryOptions(list);
                });
            });
    };

    return (
        <>
            <div className='flex justify-content-end mb-4'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown
                            optionLabel='description'
                            optionValue='itemuid'
                            filter
                            options={inventoryGroups}
                            value={inventoryGroupID}
                            placeholder='Group class'
                            className={`w-full vehicle-general__dropdown`}
                        />
                        <label className='float-label'>Inventory group (required)</label>
                    </span>
                </div>
                <Button
                    className='ml-auto settings-form__button'
                    outlined
                    onClick={() => {
                        setEditedItem({
                            description: "",
                            itemuid: NEW_ITEM,
                        });
                        setInventoryOptions([
                            ...inventoryOptions,
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

                        <div className='col-9 flex align-items-center'>Option</div>
                        <div className='col-2 flex align-items-center p-0'>Actions</div>
                    </div>
                    <div className='settings-inventory__body grid'>
                        {inventoryOptions.map((item, index) => (
                            <div key={item.itemuid} className='settings-inventory__row grid col-12'>
                                <div className='col-1 group-order'>
                                    <Button
                                        icon='pi pi-arrow-circle-up'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move up'
                                        className='p-button-text group-order__button'
                                        disabled={index === 0 || item.itemuid === NEW_ITEM}
                                    />
                                    <Button
                                        icon='pi pi-arrow-circle-down'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move down'
                                        className='p-button-text group-order__button'
                                    />
                                </div>
                                <div className='col-9 flex align-items-center'>
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
                                <div className='col-2 flex align-items-center column-gap-3'>
                                    <Button
                                        tooltip='Delete option'
                                        className='inventory-options__edit-button'
                                        icon='icon adms-edit-item'
                                        text
                                        onClick={() => {
                                            editedItem.itemuid
                                                ? setEditedItem({})
                                                : setEditedItem(item);
                                        }}
                                    />

                                    <Button
                                        tooltip='Delete option'
                                        className='inventory-options__delete-button'
                                        icon='icon adms-trash-can'
                                        text
                                        onClick={() => handleDeleteGroup(item as UserGroup)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
});
