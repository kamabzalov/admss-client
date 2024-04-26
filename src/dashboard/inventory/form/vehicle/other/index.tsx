import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { ListData, getInventoryCategoryList } from "http/services/inventory-service";
import { observer } from "mobx-react-lite";

export const VehicleOther = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory } = store;
    const [categoryList, setCategoryList] = useState<ListData[]>([]);

    useEffect(() => {
        getInventoryCategoryList().then((list) => {
            list && setCategoryList(list);
        });
    }, []);

    return (
        <div className='grid vehicle-other row-gap-2'>
            <div className='col-3'>
                <span className='p-float-label'>
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
                    <label className='float-label'>Category</label>
                </span>
            </div>

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea
                        value={inventory?.Notes}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "Notes", value })
                        }
                        className='w-full vehicle-other__text-area'
                    />
                    <label className='float-label'>Notes</label>
                </span>
            </div>
        </div>
    );
});
