import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { ReactElement, useCallback, useEffect, useState } from "react";
import {
    ListData,
    MakesListData,
    getAutoMakeModelList,
    getInventoryAutomakesList,
    getInventoryExteriorColorsList,
    getInventoryInteriorColorsList,
    getInventoryLocations,
} from "http/services/inventory-service";

import { useFormik } from "formik";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { VehicleDecodeInfo } from "http/services/vin-decoder.service";
import { Checkbox } from "primereact/checkbox";
import { Audit, Inventory, InventoryLocations } from "common/models/inventory";
import { InputNumber } from "primereact/inputnumber";

import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { AuthUser } from "http/services/auth.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { getKeyValue } from "services/local-storage.service";
import { getUserGroupActiveList } from "http/services/auth-user.service";
import { UserGroup } from "common/models/user";
import { VINDecoder } from "dashboard/common/form/vin-decoder";

//TODO: add validation
const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear();

export const VehicleGeneral = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory, inventoryAudit, changeInventoryAudit } = store;
    const year = parseInt(inventory.Year, 10);
    const mileage = (inventory?.mileage && parseFloat(inventory.mileage.replace(/,/g, "."))) || 0;

    const [user, setUser] = useState<AuthUser | null>(null);
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [interiorList, setInteriorList] = useState<ListData[]>([]);
    const [groupClassList, setGroupClassList] = useState<UserGroup[]>([]);
    const [locationList, setLocationList] = useState<InventoryLocations[]>([]);
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
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

    useEffect(() => {
        if (user) {
            getInventoryLocations(user.useruid).then((list) => {
                list && setLocationList(list);
            });
            getUserGroupActiveList(user.useruid).then((list) => {
                list && setGroupClassList(list);
            });
        }
    }, [user]);

    const handleSelectMake = useCallback(() => {
        const makeSting = inventory.Make.toLowerCase().replaceAll(" ", "");
        getAutoMakeModelList(makeSting).then((list) => {
            if (list && Object.keys(list).length) {
                setAutomakesModelList(list);
            } else {
                setAutomakesModelList([]);
            }
        });
    }, [inventory.Make]);

    useEffect(() => {
        if (inventory.Make) handleSelectMake();
    }, [handleSelectMake, inventory.Make]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option?.logo || defaultMakesLogo}
                        className='mr-2 vehicle-general__dropdown-icon'
                    />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const autoMakesOptionTemplate = (option: MakesListData) => {
        return (
            <div className='flex align-items-center'>
                <img
                    alt={option.name}
                    src={option?.logo || defaultMakesLogo}
                    className='mr-2 vehicle-general__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleVINchange = (vinInfo: VehicleDecodeInfo) => {
        if (vinInfo && inventory.GroupClassName !== "equipment") {
            if (allowOverwrite) {
                changeInventory({ key: "Make", value: vinInfo.Make });
                changeInventory({ key: "Model", value: vinInfo.Model });
                changeInventory({ key: "Year", value: vinInfo.Year });
                changeInventory({ key: "Transmission", value: vinInfo.Transmission });
                changeInventory({ key: "TypeOfFuel", value: vinInfo.TypeOfFuel });
                changeInventory({ key: "DriveLine", value: vinInfo.DriveLine });
                changeInventory({ key: "Cylinders", value: vinInfo.Cylinders });
                changeInventory({ key: "Engine", value: vinInfo.Engine });
                changeInventory({ key: "StockNo", value: vinInfo.StockNo });
            } else {
                changeInventory({ key: "Make", value: inventory.Make || vinInfo.Make });
                changeInventory({ key: "Model", value: inventory.Model || vinInfo.Model });
                changeInventory({ key: "Year", value: inventory.Year || vinInfo.Year });
                changeInventory({
                    key: "Transmission",
                    value: inventory.Transmission || vinInfo.Transmission,
                });
                changeInventory({
                    key: "TypeOfFuel",
                    value: inventory.TypeOfFuel || vinInfo.TypeOfFuel,
                });
                changeInventory({
                    key: "DriveLine",
                    value: inventory.DriveLine || vinInfo.DriveLine,
                });
                changeInventory({
                    key: "Cylinders",
                    value: inventory.Cylinders || vinInfo.Cylinders,
                });
                changeInventory({ key: "Engine", value: inventory.Engine || vinInfo.Engine });
                changeInventory({ key: "StockNo", value: inventory.StockNo || vinInfo.StockNo });
            }
        }
    };

    const renderedAuditKeys: (keyof Audit)[] = [
        "DataNeedsUpdate",
        "NeedsCleaning",
        "ReadyForSale",
        "JustArrived",
    ];

    const formik = useFormik({
        initialValues: {
            VIN: inventory?.VIN || "",
            Make: inventory.Make,
            Model: inventory.Model,
            Year: String(year),
            mileage: inventory.mileage,
        } as Partial<Inventory>,
        enableReinitialize: true,
        validate: (data) => {
            let errors: any = {};

            if (!data.VIN) {
                errors.VIN = "Data is required.";
            }

            if (!data.Make) {
                errors.Make = "Data is required.";
            }

            if (!data.Model) {
                errors.Model = "Data is required.";
            }
            if (!data.Year || Number(data.Year) < MIN_YEAR || Number(data.Year) > MAX_YEAR) {
                switch (true) {
                    case Number(data.Year) < MIN_YEAR:
                        errors.Year = `Must be greater than ${MIN_YEAR}`;
                        break;
                    case Number(data.Year) > MAX_YEAR:
                        errors.Year = `Must be less than ${MAX_YEAR}`;
                        break;
                    default:
                        errors.Year = "Data is required.";
                }
            }

            if (!data.mileage) {
                errors.mileage = "Data is required.";
            }

            return errors;
        },
        onSubmit: () => {},
    });

    useEffect(() => {
        const isValid = Object.keys(formik.errors).length === 0;
        store.isFormValid = isValid;
    }, [formik.errors, store]);

    return (
        <div className='grid vehicle-general row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='locName'
                        optionValue='locationuid'
                        filter
                        options={locationList}
                        value={inventory.locationuid}
                        onChange={({ value }) => changeInventory({ key: "locationuid", value })}
                        placeholder='Location name'
                        className={`w-full vehicle-general__dropdown ${
                            inventory.locationuid === "" && "p-inputwrapper-filled"
                        }`}
                    />
                    <label className='float-label'>Location name</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='description'
                        optionValue='description'
                        filter
                        options={groupClassList}
                        value={inventory?.GroupClassName}
                        onChange={({ value }) =>
                            changeInventory({
                                key: "GroupClassName",
                                value,
                            })
                        }
                        placeholder='Group class'
                        className='w-full vehicle-general__dropdown'
                    />
                    <label className='float-label'>Inventory group</label>
                </span>
            </div>

            <div className='col-12'>
                <hr className='form-line' />
            </div>

            <div className='col-12'>
                <div className='vehicle-general-overwrite pb-3'>
                    <Checkbox
                        checked={allowOverwrite}
                        id='vehicle-general-overwrite'
                        className='vehicle-general-overwrite__checkbox'
                        onChange={() => setAllowOverwrite(!allowOverwrite)}
                    />
                    <label className='pl-3 vehicle-general-overwrite__label'>Overwrite data</label>
                    <i className='icon adms-help vehicle-general-overwrite__icon' />
                </div>
            </div>

            <div className='col-6 relative'>
                <VINDecoder
                    value={formik.values.VIN}
                    onChange={({ target: { value } }) => changeInventory({ key: "VIN", value })}
                    onAction={handleVINchange}
                    disabled={inventory.GroupClassName === "equipment"}
                />
                <small className='p-error'>{(formik.touched.VIN && formik.errors.VIN) || ""}</small>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.StockNo || ""}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "StockNo", value })
                        }
                    />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>
            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        {...formik.getFieldProps("Make")}
                        optionLabel='name'
                        optionValue='name'
                        value={formik.values.Make}
                        filter
                        required
                        options={automakesList}
                        onChange={({ value }) => {
                            formik.setFieldValue("Make", value);
                            changeInventory({ key: "Make", value });
                        }}
                        valueTemplate={selectedAutoMakesTemplate}
                        itemTemplate={autoMakesOptionTemplate}
                        placeholder='Make (required)'
                        className={`vehicle-general__dropdown w-full ${
                            formik.touched.Make && formik.errors.Make && "p-invalid"
                        }`}
                    />
                    <label className='float-label'>Make (required)</label>
                </span>

                <small className='p-error'>
                    {(formik.touched.Make && formik.errors.Make) || ""}
                </small>
            </div>

            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        {...formik.getFieldProps("Model")}
                        optionLabel='name'
                        optionValue='name'
                        value={formik.values.Model}
                        filter={!!automakesModelList.length}
                        editable={!automakesModelList.length}
                        options={automakesModelList}
                        onChange={({ value }) => {
                            formik.setFieldValue("Model", value);
                            changeInventory({ key: "Model", value });
                        }}
                        placeholder='Model (required)'
                        className={`vehicle-general__dropdown w-full ${
                            formik.touched.Model && formik.errors.Model && "p-invalid"
                        }`}
                    />
                    <label className='float-label'>Model (required)</label>
                </span>
                <small className='p-error'>
                    {(formik.touched.Model && formik.errors.Model) || ""}
                </small>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.Trim || ""}
                        maxLength={16}
                        onChange={({ target: { value } }) =>
                            changeInventory({ key: "Trim", value })
                        }
                    />
                    <label className='float-label'>Trim</label>
                </span>
            </div>
            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        {...formik.getFieldProps("Year")}
                        className={`vehicle-general__text-input w-full ${
                            formik.errors.Year && "p-invalid"
                        }`}
                        required
                        min={0}
                        value={year || MIN_YEAR}
                        useGrouping={false}
                        onChange={({ value }) => {
                            formik.setFieldValue("Year", value);
                            changeInventory({ key: "Year", value: String(value) });
                        }}
                    />
                    <label className='float-label'>Year (required)</label>
                </span>
                <small className='p-error'>{formik.errors.Year || ""}</small>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        {...formik.getFieldProps("mileage")}
                        className={`vehicle-general__text-input w-full ${
                            formik.touched.mileage && formik.errors.mileage && "p-invalid"
                        }`}
                        required
                        value={mileage}
                        minFractionDigits={2}
                        min={0}
                        onChange={({ value }) => {
                            value && formik.setFieldValue("mileage", value);
                            changeInventory({
                                key: "mileage",
                                value: String(value).replace(".", ","),
                            });
                        }}
                    />
                    <label className='float-label'>Mileage (required)</label>
                </span>

                <small className='p-error'>
                    {(formik.touched.mileage && formik.errors.mileage) || ""}
                </small>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        value={inventory?.ExteriorColor}
                        filter
                        required
                        onChange={({ value }) => changeInventory({ key: "ExteriorColor", value })}
                        options={colorList}
                        placeholder='Color'
                        className='w-full vehicle-general__dropdown'
                    />
                    <label className='float-label'>Color</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        value={inventory?.InteriorColor}
                        filter
                        required
                        onChange={({ value }) => changeInventory({ key: "InteriorColor", value })}
                        options={interiorList}
                        placeholder='Interior color'
                        className='w-full vehicle-general__dropdown'
                    />
                    <label className='float-label'>Interior color</label>
                </span>
            </div>

            <div className='flex col-12'>
                <h3 className='vehicle-general__title m-0 pr-3'>Audit</h3>
                <hr className='vehicle-general__line flex-1' />
            </div>

            {Object.entries(inventoryAudit).map(([key, value]) => {
                const typedKey = key as keyof Audit;

                if (!renderedAuditKeys.includes(typedKey)) return null;

                const inputLabel = typedKey.replace(/(?!^)([A-Z]|\d+)/g, " $1");

                return (
                    <div
                        className='col-3 vehicle-options__checkbox flex align-items-center'
                        key={key}
                    >
                        <Checkbox
                            inputId={`audit-${key}`}
                            name={`audit-${key}`}
                            checked={!!value}
                            onChange={() => changeInventoryAudit(typedKey)}
                        />
                        <label htmlFor={`audit-${key}`} className='ml-2'>
                            {inputLabel}
                        </label>
                    </div>
                );
            })}
        </div>
    );
});
