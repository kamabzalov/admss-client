import {
    ListData,
    getInventoryInteriorColorsList,
    getInventoryTransmissionTypesList,
    getInventoryFuelTypesList,
    getInventoryDrivelineList,
    getInventoryCylindersList,
} from "http/services/inventory-service";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";

export const VehicleDescription = (): ReactElement => {
    const [selectedTransmission, setSelectedTransmission] = useState<string>("");
    const [transmissionList, setTransmissionList] = useState<ListData[]>([]);
    const [selectedFuel, setSelectedFuel] = useState<string>("");
    const [fuelList, setFuelList] = useState<ListData[]>([]);
    const [selectedDriveLine, setSelectedDriveLine] = useState<string>("");
    const [driveLineList, setDriveLineList] = useState<ListData[]>([]);
    const [selectedCylinders, setSelectedCylinders] = useState<string>("");
    const [cylindersList, setCylindersList] = useState<ListData[]>([]);
    const [selectedInterior, setSelectedInterior] = useState<string>("");
    const [interiorList, setInteriorList] = useState<ListData[]>([]);
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
        getInventoryInteriorColorsList().then((list) => {
            list && setInteriorList(list);
        });
    }, []);
    return (
        <div className='grid vehicle-description row-gap-2'>
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    value={selectedTransmission}
                    onChange={(e) => setSelectedTransmission(e.value)}
                    options={transmissionList}
                    placeholder='Transmission'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.value)}
                    options={fuelList}
                    placeholder='Type of Fuel (required)'
                    className='w-full vehicle-description__dropdown'
                />
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    value={selectedDriveLine}
                    onChange={(e) => setSelectedDriveLine(e.value)}
                    options={driveLineList}
                    placeholder='Drive Line'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    value={selectedCylinders}
                    onChange={(e) => setSelectedCylinders(e.value)}
                    options={cylindersList}
                    placeholder='Cylinders'
                    className='w-full vehicle-description__dropdown'
                />
            </div>

            <div className='col-8'>
                <Dropdown
                    optionLabel='name'
                    value={selectedInterior}
                    onChange={(e) => setSelectedInterior(e.value)}
                    options={interiorList}
                    placeholder='Interior color'
                    className='w-full vehicle-description__dropdown'
                />
            </div>
        </div>
    );
};
