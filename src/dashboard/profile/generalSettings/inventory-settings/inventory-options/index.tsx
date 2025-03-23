import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { UserGroup } from "common/models/user";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";
import { getInventoryGroupOptions } from "http/services/inventory-service";
import { Dropdown } from "primereact/dropdown";
import { observer } from "mobx-react-lite";
import { GeneralInventoryOptions } from "common/models/general-settings";
import { NEW_ITEM, HeaderColumn, InventoryOptionRow } from "./template";

export const SettingsInventoryOptions = observer((): ReactElement => {
    const toast = useToast();
    const store = useStore().generalSettingsStore;
    const { inventoryGroupID, inventoryGroups } = store;

    const [inventoryOptions, setInventoryOptions] = useState<Partial<GeneralInventoryOptions>[]>(
        []
    );
    const [editedItem, setEditedItem] = useState<Partial<GeneralInventoryOptions>>({});

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

    const handleSaveOption = () => {};
    const handleDeleteOption = (optionuid: string) => {};

    const midpoint = Math.ceil(inventoryOptions.length / 2);
    const leftColumnOptions = inventoryOptions.slice(0, midpoint);
    const rightColumnOptions = inventoryOptions.slice(midpoint);

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
                            onChange={(e) => {
                                store.inventoryGroupID = e.value;
                            }}
                            placeholder='Group class'
                            className={`w-full vehicle-general__dropdown`}
                        />
                        <label className='float-label'>Options by inventory group</label>
                    </span>
                </div>
                <Button
                    className='ml-auto settings-form__button'
                    outlined
                    onClick={() => {
                        setEditedItem({ name: "", itemuid: NEW_ITEM });
                        setInventoryOptions([...inventoryOptions, { name: "", itemuid: NEW_ITEM }]);
                    }}
                >
                    New Option
                </Button>
            </div>
            <div className='grid general-inventory-option p-2'>
                {!inventoryOptions.length ? (
                    <div className='col-12'>No options available</div>
                ) : (
                    <div className='col-12 grid p-0'>
                        <div className='col-6 p-0'>
                            <HeaderColumn />
                            <div className='general-inventory-option__body'>
                                {leftColumnOptions.map((item, index) => (
                                    <InventoryOptionRow
                                        key={item.itemuid}
                                        item={item}
                                        index={index}
                                        isFirst={index === 0}
                                        editedItem={editedItem}
                                        setEditedItem={setEditedItem}
                                        handleSaveOption={handleSaveOption}
                                        handleDeleteOption={handleDeleteOption}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className='col-6 p-0'>
                            <HeaderColumn />
                            <div className='general-inventory-option__body'>
                                {rightColumnOptions.map((item, index) => (
                                    <InventoryOptionRow
                                        key={item.itemuid}
                                        item={item}
                                        index={index}
                                        isFirst={index === 0}
                                        editedItem={editedItem}
                                        setEditedItem={setEditedItem}
                                        handleSaveOption={handleSaveOption}
                                        handleDeleteOption={handleDeleteOption}
                                        totalOffset={midpoint}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});
