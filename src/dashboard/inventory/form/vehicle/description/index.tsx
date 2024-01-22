import {
    ListData,
    getInventoryTransmissionTypesList,
    getInventoryFuelTypesList,
    getInventoryDrivelineList,
    getInventoryCylindersList,
    getInventoryEngineList,
} from "http/services/inventory-service";
import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";

export const VehicleDescription = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory } = store;
    const [transmissionList, setTransmissionList] = useState<ListData[]>([]);
    const [fuelList, setFuelList] = useState<ListData[]>([]);
    const [driveLineList, setDriveLineList] = useState<ListData[]>([]);
    const [cylindersList, setCylindersList] = useState<ListData[]>([]);
    const [engineList, setEngineList] = useState<ListData[]>([]);
    useEffect(() => {
        getInventoryTransmissionTypesList().then((list) => {
            list && setTransmissionList(list);
        });
        getInventoryFuelTypesList().then((list) => {
            list && setFuelList(list);
        });
        getInventoryDrivelineList().then((list) => {
            list && setDriveLineList(list);
        });
        getInventoryCylindersList().then((list) => {
            list && setCylindersList(list);
        });
        getInventoryEngineList().then((list) => {
            list && setEngineList(list);
        });
    }, []);
    return (
        <div className='grid vehicle-description row-gap-2'>
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Transmission}
                    onChange={({ value }) => changeInventory({ key: "Transmission", value })}
                    options={transmissionList}
                    placeholder='Transmission'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.TypeOfFuel}
                    onChange={({ value }) => changeInventory({ key: "TypeOfFuel", value })}
                    options={fuelList}
                    placeholder='Type of Fuel (required)'
                    className='w-full vehicle-description__dropdown'
                />
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.DriveLine}
                    onChange={({ value }) => changeInventory({ key: "DriveLine", value })}
                    options={driveLineList}
                    placeholder='Drive Line'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Cylinders}
                    onChange={({ value }) => changeInventory({ key: "Cylinders", value })}
                    options={cylindersList}
                    placeholder='Cylinders'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-8'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Engine}
                    onChange={({ value }) => changeInventory({ key: "Engine", value })}
                    //TODO: Remove name value from dropdown list
                    options={[...engineList, { name: inventory?.Engine }]}
                    placeholder='Engine description'
                    className='w-full vehicle-description__dropdown'
                />
            </div>
        </div>
    );
});
