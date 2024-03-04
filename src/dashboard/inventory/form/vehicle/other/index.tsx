import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import {
    ListData,
    getInventoryCategoryList,
    getInventoryGroupList,
} from "http/services/inventory-service";
import { observer } from "mobx-react-lite";

export const VehicleOther = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory } = store;
    const [groupClassList, setGroupClassList] = useState<ListData[]>([]);
    const [categoryList, setCategoryList] = useState<ListData[]>([]);
    useEffect(() => {
        getInventoryGroupList().then((list) => {
            list && setGroupClassList(list);
        });
        getInventoryCategoryList().then((list) => {
            list && setCategoryList(list);
        });
    }, []);
    return (
        <div className='grid vehicle-other row-gap-2'>
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    filter
                    //TODO: add value, options, onChange
                    placeholder='Location name'
                    className='w-full vehicle-other__dropdown'
                />
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='id'
                    filter
                    options={groupClassList}
                    value={inventory?.GroupClass}
                    onChange={({ value }) => changeInventory({ key: "GroupClass", value })}
                    placeholder='Group class'
                    className='w-full vehicle-other__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    options={categoryList}
                    value={inventory?.Category}
                    onChange={({ value }) => changeInventory({ key: "Category", value })}
                    placeholder='Category'
                    className='w-full vehicle-other__dropdown'
                />
            </div>

            <div className='col-12'>
                <InputTextarea
                    placeholder='Notes'
                    value={inventory?.Notes}
                    onChange={({ target: { value } }) => changeInventory({ key: "Notes", value })}
                    className='w-full vehicle-other__text-area'
                />
            </div>
        </div>
    );
});
