import { Inventory } from "common/models/inventory";
import { useFormikContext } from "formik";
import {
    ListData,
    getInventoryTransmissionTypesList,
    getInventoryFuelTypesList,
    getInventoryDrivelineList,
    getInventoryCylindersList,
    getInventoryEngineList,
    getInventoryBodyTypesList,
} from "http/services/inventory-service";
import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";

export const VehicleDescription = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory, formErrorIndex } = store;

    const { errors, setFieldValue } = useFormikContext<Inventory>();
    const [transmissionList, setTransmissionList] = useState<ListData[]>([]);
    const [fuelList, setFuelList] = useState<ListData[]>([]);
    const [driveLineList, setDriveLineList] = useState<ListData[]>([]);
    const [cylindersList, setCylindersList] = useState<ListData[]>([]);
    const [engineList, setEngineList] = useState<ListData[]>([]);
    const [bodyTypeList, setBodyTypeList] = useState<ListData[]>([]);

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
        getInventoryBodyTypesList().then((list) => {
            list && setBodyTypeList(list);
        });
    }, []);

    useEffect(() => {
        if (errors.TypeOfFuel) {
            store.formErrorIndex = [...formErrorIndex, 2];
        } else {
            store.formErrorIndex = formErrorIndex.filter((index) => index !== 2);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors]);

    return (
        <div className='grid vehicle-description row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.Transmission}
                        onChange={({ value }) => {
                            changeInventory({ key: "Transmission", value });
                        }}
                        options={transmissionList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Transmission</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.BodyStyle}
                        onChange={({ value }) => {
                            changeInventory({ key: "BodyStyle", value });
                        }}
                        options={bodyTypeList}
                        className='w-full vehicle-description__dropdown'
                        panelStyle={{ maxWidth: "250px" }}
                    />
                    <label className='float-label'>Body Type</label>
                </span>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        options={fuelList}
                        value={inventory.TypeOfFuel}
                        onChange={({ value }) => {
                            setFieldValue("TypeOfFuel", value);
                            changeInventory({ key: "TypeOfFuel", value });
                        }}
                        className={`vehicle-description__dropdown w-full ${
                            errors.TypeOfFuel ? "p-invalid" : ""
                        }`}
                        panelStyle={{ maxWidth: "250px" }}
                    />
                    <label className='float-label'>Type of Fuel (required)</label>
                </span>
                <small className='p-error'>{errors.TypeOfFuel}</small>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.DriveLine}
                        onChange={({ value }) => {
                            changeInventory({ key: "DriveLine", value });
                        }}
                        options={driveLineList}
                        className='w-full vehicle-description__dropdown'
                        panelStyle={{ maxWidth: "250px" }}
                    />
                    <label className='float-label'>Drive Line</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.Cylinders}
                        onChange={({ value }) => {
                            changeInventory({ key: "Cylinders", value });
                        }}
                        options={cylindersList}
                        className='w-full vehicle-description__dropdown'
                        panelStyle={{ maxWidth: "250px" }}
                    />
                    <label className='float-label'>Cylinders</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        value={inventory.Engine}
                        filter
                        onChange={({ value }) => {
                            changeInventory({ key: "Engine", value });
                        }}
                        options={engineList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Engine description</label>
                </span>
            </div>
        </div>
    );
});
