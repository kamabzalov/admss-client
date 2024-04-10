import { Inventory } from "common/models/inventory";
import { useFormik } from "formik";
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

    const formik = useFormik({
        initialValues: {
            TypeOfFuel: inventory.TypeOfFuel,
        } as Partial<Inventory>,
        enableReinitialize: true,
        validate: (data) => {
            let errors: any = {};

            if (!data.TypeOfFuel) {
                errors.TypeOfFuel = "Data is required.";
            } else {
                changeInventory({ key: "TypeOfFuel", value: data.TypeOfFuel });
            }

            return errors;
        },
        validateOnChange: true,
        onSubmit: () => {},
    });

    const isFormFieldInvalid = (name: keyof Inventory) => {
        return !!formik.errors[name] && formik.touched[name];
    };

    const getFormErrorMessage = (name: keyof Inventory) => {
        return isFormFieldInvalid(name) ? (
            <small className='p-error'>&nbsp;</small>
        ) : (
            <small className='p-error'>{formik.errors[name]}</small>
        );
    };
    return (
        <div className='grid vehicle-description row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        value={inventory?.Transmission}
                        onChange={({ value }) => changeInventory({ key: "Transmission", value })}
                        options={transmissionList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Transmission</label>
                </span>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        options={fuelList}
                        value={formik.values.TypeOfFuel}
                        onChange={({ value }) => formik.setFieldValue("TypeOfFuel", value)}
                        className={`vehicle-description__dropdown w-full ${
                            !isFormFieldInvalid("TypeOfFuel") && "p-invalid"
                        }`}
                    />
                    <label className='float-label'>Type of Fuel (required)</label>
                </span>
                {getFormErrorMessage("TypeOfFuel")}
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        value={inventory?.DriveLine}
                        onChange={({ value }) => changeInventory({ key: "DriveLine", value })}
                        options={driveLineList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Drive Line</label>
                </span>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        value={inventory?.Cylinders}
                        onChange={({ value }) => changeInventory({ key: "Cylinders", value })}
                        options={cylindersList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Cylinders</label>
                </span>
            </div>

            <div className='col-8'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        value={inventory?.Engine}
                        filter
                        onChange={({ value }) => changeInventory({ key: "Engine", value })}
                        options={engineList}
                        className='w-full vehicle-description__dropdown'
                    />
                    <label className='float-label'>Engine description</label>
                </span>
            </div>
        </div>
    );
});
