import { observer } from "mobx-react-lite";
import { ReactElement, useCallback, useEffect, useId, useState } from "react";
import "./index.css";
import {
    getAutoMakeModelList,
    getInventoryAutomakesList,
    getInventoryBodyTypesList,
    getInventoryExteriorColorsList,
} from "http/services/inventory-service";
import { DropdownProps } from "primereact/dropdown";
import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { useFormikContext } from "formik";
import { Checkbox } from "primereact/checkbox";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import {
    CurrencyInput,
    DateInput,
    NumberInput,
    PhoneInput,
    TextInput,
} from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { PartialDeal } from "dashboard/deals/form";
import { VINDecoder } from "dashboard/common/form/vin-decoder";
import { VehicleDecodeInfo } from "http/services/vin-decoder.service";
import { MakesListData } from "common/models/inventory";
import { ListData } from "common/models";
import { ComboBox } from "dashboard/common/form/dropdown";
import { AddToInventory, DealExtData } from "common/models/deals";
import { useLocation } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";

interface DealRetailTradeProps {
    tradeNumber: 1 | 2;
}

type TradeSuffix =
    | "VIN"
    | "Make"
    | "Model"
    | "Year"
    | "Mileage"
    | "Color"
    | "BodyStyle"
    | "Title_Num"
    | "StockNum"
    | "OdomInExcess"
    | "OdomNotActual"
    | "Allowance"
    | "Lien_Payoff"
    | "Lien_Per_Diem"
    | "Lien_Payoff_Good_Through"
    | "Lien_Name"
    | "Lien_Address"
    | "Lien_Phone"
    | "Lien_Contact";

const getTradeField = (tradeNumber: 1 | 2, suffix: TradeSuffix): keyof DealExtData =>
    `Trade${tradeNumber}_${suffix}` as keyof DealExtData;

export const DealRetailTrade = observer(({ tradeNumber }: DealRetailTradeProps): ReactElement => {
    const store = useStore().dealStore;
    const { values, errors, setFieldValue, setFieldTouched } = useFormikContext<PartialDeal>();
    const { pathname, search } = useLocation();
    const currentPath = pathname + search;
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [bodyTypeList, setBodyTypeList] = useState<ListData[]>([]);
    const uniqueId = useId();

    const getValue = useCallback(
        (suffix: TradeSuffix): string => {
            const value = (values as Record<string, unknown>)[`Trade${tradeNumber}_${suffix}`];
            return value?.toString() || "";
        },
        [tradeNumber, values]
    );

    const getExtValue = useCallback(
        (suffix: TradeSuffix): string | number => {
            const extData = store.dealExtData as unknown as Record<
                string,
                string | number | null | undefined
            >;
            const value = extData[`Trade${tradeNumber}_${suffix}`];
            if (value === undefined || value === null) return "";
            return value;
        },
        [store.dealExtData, tradeNumber]
    );

    const getError = useCallback(
        (suffix: TradeSuffix): string => {
            const value = (errors as Record<string, unknown>)[`Trade${tradeNumber}_${suffix}`];
            return value?.toString() || "";
        },
        [errors, tradeNumber]
    );

    const isOverwriteEnabled =
        tradeNumber === 1 ? store.dealFirstTradeOverwrite : store.dealSecondTradeOverwrite;
    const inventoryFlag =
        tradeNumber === 1
            ? AddToInventory.TRADE_FIRST_ENABLED
            : AddToInventory.TRADE_SECOND_ENABLED;
    const isTradeChecked = Boolean(store.deal.addToInventory & inventoryFlag);
    const toggleTrade = isTradeChecked
        ? store.deal.addToInventory & ~inventoryFlag
        : store.deal.addToInventory | inventoryFlag;

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
        getInventoryBodyTypesList().then((list) => {
            list && setBodyTypeList(list);
        });
        getInventoryExteriorColorsList().then((list) => {
            list && setColorList(list);
        });
    }, []);

    const handleSelectMake = useCallback(() => {
        const makeString = getValue("Make").toLowerCase().replaceAll(" ", "");
        if (automakesList.some((item) => item.name.toLocaleLowerCase() === makeString)) {
            getAutoMakeModelList(makeString).then((list) => {
                if (list && Object.keys(list).length) {
                    setAutomakesModelList(list);
                } else {
                    setAutomakesModelList([]);
                }
            });
        }
    }, [automakesList, getValue]);

    useEffect(() => {
        if (getValue("Make")) {
            handleSelectMake();
        }
    }, [getValue, handleSelectMake]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option.logo || defaultMakesLogo}
                        className='mr-2 vehicle__dropdown-icon'
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
                    src={option.logo || defaultMakesLogo}
                    className='mr-2 vehicle__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleChangeFormValue = ({
        suffix,
        value,
    }: {
        suffix: TradeSuffix;
        value: string | number;
    }) => {
        const key = getTradeField(tradeNumber, suffix);
        setFieldValue(key, value);
        store.changeDealExtData({ key, value });
    };

    const handleVINchange = (vinInfo: VehicleDecodeInfo) => {
        if (!vinInfo) return;

        if (isOverwriteEnabled) {
            handleChangeFormValue({ suffix: "Make", value: vinInfo.Make || getValue("Make") });
            handleChangeFormValue({ suffix: "Model", value: vinInfo.Model || getValue("Model") });
            handleChangeFormValue({ suffix: "Year", value: vinInfo.Year || getValue("Year") });
            handleChangeFormValue({
                suffix: "BodyStyle",
                value: vinInfo.BodyStyle_id || getExtValue("BodyStyle"),
            });
            handleChangeFormValue({
                suffix: "Color",
                value: vinInfo.ExteriorColor || getExtValue("Color"),
            });
            handleChangeFormValue({
                suffix: "Mileage",
                value: vinInfo.mileage || getExtValue("Mileage"),
            });
            return;
        }

        handleChangeFormValue({ suffix: "Make", value: getValue("Make") || vinInfo.Make });
        handleChangeFormValue({ suffix: "Model", value: getValue("Model") || vinInfo.Model });
        handleChangeFormValue({ suffix: "Year", value: getValue("Year") || vinInfo.Year });
        handleChangeFormValue({
            suffix: "BodyStyle",
            value: getExtValue("BodyStyle") || vinInfo.BodyStyle_id,
        });
        handleChangeFormValue({
            suffix: "Color",
            value: getExtValue("Color") || vinInfo.ExteriorColor,
        });
        handleChangeFormValue({
            suffix: "Mileage",
            value: getExtValue("Mileage") || vinInfo.mileage,
        });
    };

    const handleMakeChange = useCallback(
        (value: string) => {
            handleChangeFormValue({ suffix: "Make", value });
            setAutomakesModelList([]);
        },
        [handleChangeFormValue]
    );

    const handleModelChange = useCallback(
        (value: string) => {
            handleChangeFormValue({ suffix: "Model", value });
        },
        [handleChangeFormValue]
    );

    const colorOptionValue = tradeNumber === 1 ? "name" : "id";
    const bodyStyleOptionValue = tradeNumber === 1 ? "id" : "name";

    return (
        <div className='grid deal-retail-trade row-gap-2'>
            <div className='trade-overwrite pb-3'>
                <Checkbox
                    checked={isOverwriteEnabled}
                    id={`trade-overwrite-${tradeNumber}`}
                    className='trade-overwrite__checkbox'
                    onChange={() => {
                        if (tradeNumber === 1) {
                            store.dealFirstTradeOverwrite = !store.dealFirstTradeOverwrite;
                        } else {
                            store.dealSecondTradeOverwrite = !store.dealSecondTradeOverwrite;
                        }
                    }}
                />
                <label
                    className='pl-3 trade-overwrite__label'
                    htmlFor={`trade-overwrite-${tradeNumber}`}
                >
                    Overwrite data
                </label>
                <i data-tooltip-id={uniqueId} className='icon adms-help trade-overwrite__icon' />
                <Tooltip
                    target={`[data-tooltip-id="${uniqueId}"]`}
                    content={
                        "Data received from the VIN decoder service will overwrite user-entered data."
                    }
                    position='right'
                    className='trade-overwrite__tooltip'
                    pt={{
                        text: {
                            style: {
                                whiteSpace: "nowrap",
                            },
                        },
                    }}
                />
            </div>
            <div className='col-6 relative'>
                <VINDecoder
                    value={getValue("VIN")}
                    onChange={({ target: { value } }) => {
                        handleChangeFormValue({ suffix: "VIN", value });
                    }}
                    onAction={handleVINchange}
                    error={!!getError("VIN")}
                    errorMessage={getError("VIN")}
                />
            </div>
            <div className='col-6 relative'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={getValue("Make")}
                    required
                    options={automakesList}
                    onChange={({ value }) => handleMakeChange(value)}
                    valueTemplate={selectedAutoMakesTemplate}
                    itemTemplate={autoMakesOptionTemplate}
                    className='deal-trade__dropdown w-full'
                    label='Make (required)'
                    editable
                    error={!!getError("Make")}
                    errorMessage={getError("Make")}
                />
            </div>

            <div className='col-6 relative'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={getValue("Model")}
                    editable
                    options={automakesModelList}
                    onChange={({ value }) => handleModelChange(value)}
                    className='deal-trade__dropdown w-full'
                    label='Model (required)'
                    error={!!getError("Model")}
                    errorMessage={getError("Model")}
                />
            </div>
            <div className='col-3 relative'>
                <NumberInput
                    name={getTradeField(tradeNumber, "Year")}
                    label='Year (required)'
                    className={`deal-trade__text-input w-full ${getError("Year") ? "p-invalid" : ""}`}
                    required
                    min={0}
                    useGrouping={false}
                    value={parseInt(getExtValue("Year").toString()) || null}
                    onValueChange={({ value }) => {
                        if (!value) {
                            return store.changeDealExtData({
                                key: getTradeField(tradeNumber, "Year"),
                                value: "",
                            });
                        }
                        setFieldValue(getTradeField(tradeNumber, "Year"), value);
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Year"),
                            value: String(value),
                        });
                    }}
                    error={!!getError("Year")}
                    errorMessage={getError("Year")}
                />
            </div>

            <div className='col-3 relative'>
                <NumberInput
                    name={getTradeField(tradeNumber, "Mileage")}
                    label='Mileage (required)'
                    className={`deal-trade__text-input w-full ${getError("Mileage") ? "p-invalid" : ""}`}
                    required
                    value={
                        getValue("Mileage")
                            ? parseFloat(getValue("Mileage").replace(/[^0-9.]/g, ""))
                            : null
                    }
                    useGrouping
                    min={0}
                    onValueChange={({ value }) => {
                        const valAsString = value?.toString() || "";
                        setFieldValue(getTradeField(tradeNumber, "Mileage"), valAsString);
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Mileage"),
                            value: valAsString,
                        });
                    }}
                    error={!!getError("Mileage")}
                    errorMessage={getError("Mileage")}
                />
            </div>
            <div className='col-3'>
                <ComboBox
                    optionLabel='name'
                    optionValue={colorOptionValue}
                    value={getExtValue("Color")}
                    options={colorList}
                    onChange={({ target: { value } }) =>
                        store.changeDealExtData({ key: getTradeField(tradeNumber, "Color"), value })
                    }
                    className='w-full deal-trade__dropdown'
                    label='Color'
                />
            </div>

            <div className='col-3'>
                <ComboBox
                    optionLabel='name'
                    optionValue={bodyStyleOptionValue}
                    value={getExtValue("BodyStyle")}
                    onChange={({ target: { value } }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "BodyStyle"),
                            value,
                        });
                    }}
                    editable
                    options={bodyTypeList}
                    className='w-full deal-trade__dropdown'
                    label='Body Style'
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name={getTradeField(tradeNumber, "Title_Num")}
                    label='Title#'
                    value={getExtValue("Title_Num").toString()}
                    onChange={({ target: { value } }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Title_Num"),
                            value,
                        });
                    }}
                    className='deal-trade__text-input w-full'
                />
            </div>
            <div className='col-3'>
                <TextInput
                    name={getTradeField(tradeNumber, "StockNum")}
                    label='Stock#'
                    value={getExtValue("StockNum").toString()}
                    onChange={({ target: { value } }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "StockNum"),
                            value,
                        });
                    }}
                    className='deal-trade__text-input w-full'
                />
            </div>

            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId={getTradeField(tradeNumber, "OdomInExcess")}
                    name={getTradeField(tradeNumber, "OdomInExcess")}
                    checked={!!getExtValue("OdomInExcess")}
                    onChange={() =>
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "OdomInExcess"),
                            value: Number(!getExtValue("OdomInExcess")),
                        })
                    }
                />
                <label htmlFor={getTradeField(tradeNumber, "OdomInExcess")} className='ml-2'>
                    Disclosure IN EXCESS
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId={getTradeField(tradeNumber, "OdomNotActual")}
                    name={getTradeField(tradeNumber, "OdomNotActual")}
                    checked={!!getExtValue("OdomNotActual")}
                    onChange={() =>
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "OdomNotActual"),
                            value: Number(!getExtValue("OdomNotActual")),
                        })
                    }
                />
                <label htmlFor={getTradeField(tradeNumber, "OdomNotActual")} className='ml-2'>
                    Disclosure NOT ACTUAL
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId={getTradeField(tradeNumber, "VIN")}
                    name={`${getTradeField(tradeNumber, "VIN")}_AddToInventory`}
                    checked={isTradeChecked}
                    onChange={() => store.changeAddToInventory(toggleTrade)}
                />
                <label htmlFor={getTradeField(tradeNumber, "VIN")} className='ml-2'>
                    Add to inventory
                </label>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput
                    value={Number(getExtValue("Allowance")) || 0}
                    onChange={({ value }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Allowance"),
                            value: value || 0,
                        });
                    }}
                    labelPosition='top'
                    title='Allowance'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(getExtValue("Lien_Payoff")) || 0}
                    onChange={({ value }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Payoff"),
                            value: value || 0,
                        });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(getExtValue("Lien_Per_Diem")) || 0}
                    onChange={({ value }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Per_Diem"),
                            value: value || 0,
                        });
                    }}
                    labelPosition='top'
                    title='Per Diem'
                />
            </div>
            <div className='col-3'>
                <DateInput
                    date={getExtValue("Lien_Payoff_Good_Through")}
                    checkbox
                    checked={!!getExtValue("Lien_Payoff_Good_Through")}
                    onCheckboxChange={() => {
                        const isChecked = !getExtValue("Lien_Payoff_Good_Through");
                        if (isChecked) {
                            store.changeDealExtData({
                                key: getTradeField(tradeNumber, "Lien_Payoff_Good_Through"),
                                value:
                                    Number(getExtValue("Lien_Payoff_Good_Through")) || Date.now(),
                            });
                        } else {
                            store.changeDealExtData({
                                key: getTradeField(tradeNumber, "Lien_Payoff_Good_Through"),
                                value: "",
                            });
                        }
                        store.isFormChanged = true;
                    }}
                    onChange={({ value }) =>
                        value &&
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Payoff_Good_Through"),
                            value: Number(value),
                        })
                    }
                    emptyDate
                    checkboxWithLabel
                    name='PO Good Thru'
                />
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch
                    originalPath={currentPath}
                    name='Lienholder Name'
                    value={getExtValue("Lien_Name").toString()}
                    onChange={({ target: { value } }) =>
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Name"),
                            value,
                        })
                    }
                    onRowClick={(value) =>
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Name"),
                            value,
                        })
                    }
                />
            </div>
            <div className='col-6 relative'>
                <TextInput
                    name={getTradeField(tradeNumber, "Lien_Address")}
                    label='Mailing address'
                    className={`deal-trade__text-input w-full ${getError("Lien_Address") ? "p-invalid" : ""}`}
                    value={getValue("Lien_Address")}
                    onChange={async ({ target: { value } }) => {
                        await setFieldValue(getTradeField(tradeNumber, "Lien_Address"), value);
                        setFieldTouched(getTradeField(tradeNumber, "Lien_Address"), true);
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Address"),
                            value,
                        });
                    }}
                    onBlur={() =>
                        setFieldTouched(getTradeField(tradeNumber, "Lien_Address"), true, true)
                    }
                    error={!!getError("Lien_Address")}
                    errorMessage={getError("Lien_Address")}
                />
            </div>

            <PhoneInput
                colWidth={3}
                name='Phone Number'
                value={getExtValue("Lien_Phone").toString()}
                onChange={({ target: { value } }) => {
                    setFieldValue(getTradeField(tradeNumber, "Lien_Phone"), value);
                    store.changeDealExtData({
                        key: getTradeField(tradeNumber, "Lien_Phone"),
                        value,
                    });
                }}
            />
            <div className='col-6'>
                <TextInput
                    name={getTradeField(tradeNumber, "Lien_Contact")}
                    label='Contact'
                    value={getExtValue("Lien_Contact").toString()}
                    onChange={({ target: { value } }) => {
                        store.changeDealExtData({
                            key: getTradeField(tradeNumber, "Lien_Contact"),
                            value,
                        });
                    }}
                    className='deal-trade__text-input w-full'
                />
            </div>
        </div>
    );
});
