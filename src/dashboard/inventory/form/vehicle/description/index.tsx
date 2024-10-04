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
        const fetchData = async () => {
            const [transmission, fuel, driveline, cylinders, engine, bodyType] = await Promise.all([
                getInventoryTransmissionTypesList(),
                getInventoryFuelTypesList(),
                getInventoryDrivelineList(),
                getInventoryCylindersList(),
                getInventoryEngineList(),
                getInventoryBodyTypesList(),
            ]);
            setTransmissionList(transmission || []);
            setFuelList(fuel || []);
            setDriveLineList(driveline || []);
            setCylindersList(cylinders || []);
            setEngineList(engine || []);
            setBodyTypeList(bodyType || []);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (errors.TypeOfFuel) {
            store.formErrorIndex = [...formErrorIndex, 2];
        } else {
            store.formErrorIndex = formErrorIndex.filter((index) => index !== 2);
        }
    }, [errors]);

    return (
        <div className='grid vehicle-description row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.Transmission_id?.toString() || ""}
                        onChange={({ value }) => {
                            changeInventory({ key: "Transmission_id", value });
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
                        value={inventory.BodyStyle_id?.toString() || ""}
                        onChange={({ value }) => {
                            changeInventory({ key: "BodyStyle_id", value });
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
                        optionValue='id'
                        filter
                        options={fuelList}
                        value={inventory.TypeOfFuel_id?.toString() || ""}
                        onChange={({ value }) => {
                            setFieldValue("TypeOfFuel_id", value);
                            changeInventory({ key: "TypeOfFuel_id", value });
                        }}
                        className={`vehicle-description__dropdown w-full ${
                            errors.TypeOfFuel_id ? "p-invalid" : ""
                        }`}
                        panelStyle={{ maxWidth: "250px" }}
                    />
                    <label className='float-label'>Type of Fuel (required)</label>
                </span>
                <small className='p-error'>{errors.TypeOfFuel_id}</small>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        filter
                        value={inventory.DriveLine_id?.toString() || ""}
                        onChange={({ value }) => {
                            changeInventory({ key: "DriveLine_id", value });
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
                        value={inventory.Cylinders_id?.toString() || ""}
                        onChange={({ value }) => {
                            changeInventory({ key: "Cylinders_id", value });
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
                        value={inventory.Engine_id?.toString() || ""}
                        filter
                        onChange={({ value }) => {
                            changeInventory({ key: "Engine_id", value });
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
