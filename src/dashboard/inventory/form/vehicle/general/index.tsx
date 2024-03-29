import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from "react";
import {
    ListData,
    MakesListData,
    getAutoMakeModelList,
    getInventoryAutomakesList,
    getInventoryExteriorColorsList,
    getInventoryInteriorColorsList,
} from "http/services/inventory-service";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { inventoryDecodeVIN } from "http/services/vin-decoder.service";
import { Checkbox } from "primereact/checkbox";
import { Audit } from "common/models/inventory";
import { InputNumber } from "primereact/inputnumber";

//TODO: add validation
const VIN_VALID_LENGTH = 17;

export const VehicleGeneral = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory, changeInventory, inventoryAudit, changeInventoryAudit } = store;
    const year = parseInt(inventory.Year, 10);
    const mileage = (inventory?.mileage && parseFloat(inventory.mileage.replace(/,/g, "."))) || 0;

    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
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
                        src={option.logo}
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
                    src={option.logo}
                    className='mr-2 vehicle-general__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleVINchange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
        changeInventory({ key: "VIN", value });
        if (value.length === VIN_VALID_LENGTH) {
            inventoryDecodeVIN(value).then((response) => {
                if (response) {
                    changeInventory({ key: "Make", value: response.Make });
                    changeInventory({ key: "Model", value: response.Model });
                    changeInventory({ key: "Year", value: response.Year });
                    changeInventory({ key: "Transmission", value: response.Transmission });
                    changeInventory({ key: "TypeOfFuel", value: response.TypeOfFuel });
                    changeInventory({ key: "DriveLine", value: response.DriveLine });
                    changeInventory({ key: "Cylinders", value: response.Cylinders });
                    changeInventory({ key: "Engine", value: response.Engine });
                }
            });
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
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='vehicle-general__text-input w-full'
                        value={inventory?.VIN || ""}
                        onChange={handleVINchange}
                    />
                    <label className='float-label'>VIN (required)</label>
                </span>
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
            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Make}
                    filter
                    required
                    options={automakesList}
                    onChange={({ target: { value } }) => changeInventory({ key: "Make", value })}
                    valueTemplate={selectedAutoMakesTemplate}
                    itemTemplate={autoMakesOptionTemplate}
                    placeholder='Make (required)'
                    className='w-full vehicle-general__dropdown'
                />
            </div>

            <div className='col-6'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={inventory?.Model}
                    filter={!!automakesModelList.length}
                    editable={!automakesModelList.length}
                    options={automakesModelList}
                    onChange={({ value }) => changeInventory({ key: "Model", value })}
                    placeholder='Model (required)'
                    className='w-full vehicle-general__dropdown'
                />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputNumber
                        className='vehicle-general__text-input w-full'
                        required
                        value={year || 0}
                        useGrouping={false}
                        onChange={({ value }) =>
                            changeInventory({ key: "Year", value: String(value) })
                        }
                    />
                    <label className='float-label'>Year (required)</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputNumber
                        className='vehicle-general__text-input w-full'
                        required
                        value={mileage}
                        minFractionDigits={2}
                        onChange={({ value }) =>
                            value &&
                            changeInventory({
                                key: "mileage",
                                value: String(value).replace(".", ","),
                            })
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
                    filter
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
                    optionValue='name'
                    value={inventory?.InteriorColor}
                    filter
                    required
                    onChange={({ value }) => changeInventory({ key: "InteriorColor", value })}
                    options={interiorList}
                    placeholder='Interior color'
                    className='w-full vehicle-general__dropdown'
                />
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
