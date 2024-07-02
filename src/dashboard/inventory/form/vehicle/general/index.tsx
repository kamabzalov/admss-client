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

import { useFormikContext } from "formik";
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
import { Button } from "primereact/button";

const EQUIPMENT = "equipment";

const parseMileage = (mileage: string): number => {
    return parseFloat(mileage.replace(/,/g, ""));
};

export const VehicleGeneral = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory, inventoryAudit, changeInventoryAudit } = store;
    const { values, errors, setFieldValue, getFieldProps, validateField, setFieldTouched } =
        useFormikContext<Inventory>();

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
        if (automakesList.some((item) => item.name.toLocaleLowerCase() === makeSting)) {
            getAutoMakeModelList(makeSting).then((list) => {
                if (list && Object.keys(list).length) {
                    setAutomakesModelList(list);
                } else {
                    setAutomakesModelList([]);
                }
            });
        }
    }, [automakesList, inventory.Make]);

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
        if (vinInfo && inventory.GroupClassName !== EQUIPMENT) {
            if (allowOverwrite) {
                changeInventory({ key: "Make", value: vinInfo.Make });
                changeInventory({ key: "Model", value: vinInfo.Model });
                changeInventory({ key: "Year", value: vinInfo.Year });
                changeInventory({ key: "GroupClassName", value: vinInfo.GroupClassName });
                changeInventory({ key: "Transmission", value: vinInfo.Transmission_id });
                changeInventory({ key: "TypeOfFuel", value: vinInfo.TypeOfFuel_id });
                changeInventory({ key: "DriveLine", value: vinInfo.DriveLine_id });
                changeInventory({ key: "Cylinders", value: vinInfo.Cylinders_id });
                changeInventory({ key: "Engine", value: vinInfo.Engine_id });
                changeInventory({ key: "StockNo", value: vinInfo.StockNo });
                changeInventory({ key: "Trim", value: vinInfo.Trim });
                changeInventory({ key: "BodyStyle", value: vinInfo.BodyStyle });
                changeInventory({ key: "InteriorColor", value: vinInfo.InteriorColor });
                changeInventory({ key: "ExteriorColor", value: vinInfo.ExteriorColor });
                changeInventory({ key: "mileage", value: vinInfo.mileage });
            } else {
                changeInventory({ key: "Make", value: inventory.Make || vinInfo.Make });
                changeInventory({ key: "Model", value: inventory.Model || vinInfo.Model });
                changeInventory({ key: "Year", value: inventory.Year || vinInfo.Year });
                changeInventory({
                    key: "GroupClassName",
                    value: inventory.GroupClassName || vinInfo.GroupClassName,
                });
                changeInventory({
                    key: "Transmission",
                    value: inventory.Transmission || vinInfo.Transmission_id,
                });
                changeInventory({
                    key: "TypeOfFuel",
                    value: inventory.TypeOfFuel || vinInfo.TypeOfFuel_id,
                });
                changeInventory({
                    key: "DriveLine",
                    value: inventory.DriveLine || vinInfo.DriveLine_id,
                });
                changeInventory({
                    key: "Cylinders",
                    value: inventory.Cylinders || vinInfo.Cylinders_id,
                });
                changeInventory({ key: "Engine", value: inventory.Engine || vinInfo.Engine_id });
                changeInventory({ key: "StockNo", value: inventory.StockNo || vinInfo.StockNo });
                changeInventory({ key: "Trim", value: inventory.Trim || vinInfo.Trim });
                changeInventory({
                    key: "BodyStyle",
                    value: inventory.BodyStyle || vinInfo.BodyStyle,
                });
                changeInventory({
                    key: "InteriorColor",
                    value: inventory.InteriorColor || vinInfo.InteriorColor,
                });
                changeInventory({
                    key: "ExteriorColor",
                    value: inventory.ExteriorColor || vinInfo.ExteriorColor,
                });
                changeInventory({ key: "mileage", value: inventory.mileage || vinInfo.mileage });
            }
        }
    };

    const renderedAuditKeys: (keyof Audit)[] = [
        "DataNeedsUpdate",
        "NeedsCleaning",
        "ReadyForSale",
        "JustArrived",
    ];

    return (
        <div className='grid vehicle-general row-gap-2'>
            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='locName'
                        optionValue='locationuid'
                        filter
                        options={locationList}
                        value={values.locationuid}
                        onChange={({ value }) => {
                            setFieldValue("locationuid", value);
                            changeInventory({ key: "locationuid", value });
                        }}
                        placeholder='Location name'
                        className={`w-full vehicle-general__dropdown ${
                            inventory.locationuid === "" && "p-inputwrapper-filled"
                        } ${errors.locationuid ? "p-invalid" : ""}`}
                    />
                    <label className='float-label'>Location name (required)</label>
                </span>
                <small className='p-error'>{errors.locationuid}</small>
            </div>
            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='description'
                        optionValue='description'
                        filter
                        options={groupClassList}
                        value={values?.GroupClassName}
                        onChange={({ value }) => {
                            setFieldValue("GroupClassName", value);
                            changeInventory({
                                key: "GroupClassName",
                                value,
                            });
                        }}
                        placeholder='Group class'
                        className={`w-full vehicle-general__dropdown ${
                            errors.GroupClassName ? "p-invalid" : ""
                        }`}
                    />
                    <label className='float-label'>Inventory group (required)</label>
                </span>
                <small className='p-error'>{errors.GroupClassName}</small>
            </div>

            <div className='col-12'>
                <hr className='form-line' />
            </div>
            {inventory.GroupClassName === EQUIPMENT ? (
                <div className='col-6 relative'>
                    <span className='p-float-label'>
                        <InputText
                            value={values.VIN}
                            onChange={({ target: { value } }) => {
                                setFieldValue("VIN", value);
                                changeInventory({ key: "VIN", value });
                            }}
                            className={`w-full ${errors.VIN ? "p-invalid" : ""}`}
                        />
                        <label className='float-label'>VIN (required)</label>
                    </span>
                    <small className='p-error'>{errors.VIN}</small>
                </div>
            ) : (
                <>
                    <div className='col-12'>
                        <div className='vehicle-general-overwrite pb-3'>
                            <Checkbox
                                checked={allowOverwrite}
                                inputId='vehicle-general-overwrite'
                                className='vehicle-general-overwrite__checkbox'
                                onChange={() => setAllowOverwrite(!allowOverwrite)}
                            />
                            <label
                                htmlFor='vehicle-general-overwrite'
                                className='pl-3 vehicle-general-overwrite__label'
                            >
                                Overwrite data
                            </label>
                            <Button
                                text
                                tooltip='Data received from the VIN decoder service will overwrite user-entered data.'
                                icon='icon adms-help'
                                type='button'
                                severity='info'
                                className='vehicle-general-overwrite__icon transparent'
                            />
                        </div>
                    </div>

                    <div className='col-6 relative'>
                        <VINDecoder
                            value={values.VIN}
                            onChange={({ target: { value } }) => {
                                setFieldValue("VIN", value);
                                changeInventory({ key: "VIN", value });
                            }}
                            onAction={handleVINchange}
                            disabled={inventory.GroupClassName === "equipment"}
                            className={`w-full ${errors.VIN ? "p-invalid" : ""}`}
                        />
                        <small className='p-error'>{errors.VIN}</small>
                    </div>
                </>
            )}

            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <InputText
                        className={
                            "vehicle-general__text-input w-full" +
                            (errors.StockNo ? " p-invalid" : "")
                        }
                        name='StockNo'
                        value={values.StockNo}
                        onChange={async ({ target: { value } }) => {
                            await setFieldValue("StockNo", value);
                            await setFieldTouched("StockNo", true, true);
                            changeInventory({ key: "StockNo", value });
                            await validateField("StockNo");
                        }}
                    />
                    <label className='float-label'>Stock#</label>
                </span>
                <small className='p-error'>{errors.StockNo}</small>
            </div>
            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        {...getFieldProps("Make")}
                        optionLabel='name'
                        optionValue='name'
                        value={values.Make}
                        filter
                        required
                        options={automakesList}
                        onChange={({ value }) => {
                            setFieldValue("Make", value);
                            changeInventory({ key: "Make", value });
                        }}
                        valueTemplate={selectedAutoMakesTemplate}
                        itemTemplate={autoMakesOptionTemplate}
                        placeholder='Make (required)'
                        editable
                        className={`vehicle-general__dropdown w-full ${
                            errors.Make ? "p-invalid" : ""
                        }`}
                    />
                    <label className='float-label'>Make (required)</label>
                </span>

                <small className='p-error'>{errors.Make}</small>
            </div>

            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        {...getFieldProps("Model")}
                        optionLabel='name'
                        optionValue='name'
                        value={values.Model}
                        filter={!!automakesModelList.length}
                        editable
                        options={automakesModelList}
                        onChange={({ value }) => {
                            setFieldValue("Model", value);
                            changeInventory({ key: "Model", value });
                        }}
                        placeholder='Model (required)'
                        className={`vehicle-general__dropdown w-full ${
                            errors.Model ? "p-invalid" : ""
                        }`}
                    />
                    <label className='float-label'>Model (required)</label>
                </span>
                <small className='p-error'>{errors.Model}</small>
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
                        {...getFieldProps("Year")}
                        className={`vehicle-general__text-input w-full ${
                            errors.Year ? "p-invalid" : ""
                        }`}
                        useGrouping={false}
                        value={parseInt(values.Year) || null}
                        onChange={({ value }) => {
                            if (!value) {
                                return changeInventory({ key: "Year", value: "" });
                            }
                            setFieldValue("Year", value);
                            changeInventory({ key: "Year", value: String(value) });
                        }}
                    />
                    <label className='float-label'>Year</label>
                </span>
                <small className='p-error'>{errors.Year}</small>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        {...getFieldProps("mileage")}
                        className={`vehicle-general__text-input w-full ${
                            errors.mileage ? "p-invalid" : ""
                        }`}
                        required
                        value={parseMileage(inventory?.mileage || "0")}
                        useGrouping={false}
                        min={0}
                        onChange={({ value }) => {
                            changeInventory({
                                key: "mileage",
                                value: value ? String(value) : "0",
                            });
                        }}
                    />
                    <label className='float-label'>Mileage</label>
                </span>
                <small className='p-error'>{errors.mileage}</small>
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
