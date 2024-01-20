import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import {
    ListData,
    MakesListData,
    getInventoryAutomakesList,
    getInventoryExteriorColorsList,
    getInventoryInteriorColorsList,
} from "http/services/inventory-service";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { InputNumber } from "primereact/inputnumber";

export const VehicleGeneral = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory } = store;

    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [interiorList, setInteriorList] = useState<ListData[]>([]);

    useEffect(() => {
        getInventoryAutomakesList().then((list) => {
            if (list) {
                const upperCasedList = list.map((item) => ({
                    ...item,
                    name: item.name.toUpperCase(),
                }));
                setAutomakesList(upperCasedList);
            }
        });
        getInventoryExteriorColorsList().then((list) => {
            list && setColorList(list);
        });
        getInventoryInteriorColorsList().then((list) => {
            list && setInteriorList(list);
        });
    }, []);

    return (
        <div className='grid vehicle-general row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.VIN}
                        onChange={({ target: { value } }) => changeInventory({ key: "VIN", value })}
                    />
                    <label className='float-label'>VIN (required)</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.StockNo}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "StockNo", value })
                        }
                    />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Make}
                    required
                    onChange={({ value }) => changeInventory({ key: "Make", value })}
                    options={automakesList}
                    placeholder='Make (required)'
                    className='w-full vehicle-general__dropdown'
                />
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Model}
                    //TODO: add options
                    options={[{ name: inventory?.Model }]}
                    onChange={({ value }) => changeInventory({ key: "Model", value })}
                    placeholder='Model (required)'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        required
                        value={inventory?.Year}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "Year", value })
                        }
                    />
                    <label className='float-label'>Year (required)</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputNumber
                        className='vehicle-general__number-input w-full'
                        required
                        value={inventory?.mileage}
                        onChange={({ value }) =>
                            value && changeInventory({ key: "mileage", value })
                        }
                    />
                    <label className='float-label'>Mileage (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.ExteriorColor}
                    required
                    onChange={({ value }) => changeInventory({ key: "ExteriorColor", value })}
                    options={[...colorList, { name: inventory?.ExteriorColor }]}
                    placeholder='Color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.InteriorColor}
                    required
                    onChange={({ value }) => changeInventory({ key: "InteriorColor", value })}
                    options={[...interiorList, { name: inventory?.InteriorColor }]}
                    placeholder='Interior color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
        </div>
    );
});
