import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { useEffect, useState } from "react";
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

export const VehicleGeneral = observer(() => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory, isLoading } = store;

    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [interiorList, setInteriorList] = useState<ListData[]>([]);

    useEffect(() => {
        getInventoryAutomakesList().then((list) => {
            list && setAutomakesList(list);
        });
        getInventoryExteriorColorsList().then((list) => {
            list && setColorList(list);
        });
        getInventoryInteriorColorsList().then((list) => {
            list && setInteriorList(list);
        });
    }, []);

    if (isLoading)
        return (
            <div className='flex justify-content-center align-items-center w-full h-full'>
                Loading...
            </div>
        );

    return (
        <div className='grid vehicle-general row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.VIN}
                        onChange={({ target }) =>
                            changeInventory({ key: "VIN", value: target.value })
                        }
                    />
                    <label className='float-label'>VIN (required)</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.StockNo}
                        onChange={({ target }) =>
                            changeInventory({ key: "StockNo", value: target.value })
                        }
                    />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>
            <div className='col-6'>
                {automakesList.length ? (
                    <Dropdown
                        optionLabel='name'
                        value={inventory?.Make}
                        required
                        onChange={({ value }) => changeInventory({ key: "Make", value })}
                        options={automakesList}
                        placeholder='Make (required)'
                        className='w-full vehicle-general__dropdown'
                    />
                ) : (
                    <Dropdown
                        disabled
                        placeholder='Loading makes...'
                        className='w-full vehicle-general__dropdown'
                    />
                )}
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
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
                    />
                    <label className='float-label'>Mileage (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={inventory?.ExteriorColor}
                    required
                    onChange={({ value }) => changeInventory({ key: "ExteriorColor", value })}
                    options={colorList}
                    placeholder='Color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={inventory?.InteriorColor}
                    required
                    onChange={({ value }) => changeInventory({ key: "InteriorColor", value })}
                    options={interiorList}
                    placeholder='Interior color'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
        </div>
    );
});
