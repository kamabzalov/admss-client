import { observer } from "mobx-react-lite";
import { ReactElement, useCallback, useEffect, useState } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import {
    getAutoMakeModelList,
    getInventoryAutomakesList,
    getInventoryBodyTypesList,
    getInventoryExteriorColorsList,
} from "http/services/inventory-service";
import { DropdownProps } from "primereact/dropdown";
import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { useFormikContext } from "formik";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { CurrencyInput, DateInput, PhoneInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { PartialDeal } from "dashboard/deals/form";
import { VINDecoder } from "dashboard/common/form/vin-decoder";
import { VehicleDecodeInfo } from "http/services/vin-decoder.service";
import { MakesListData } from "common/models/inventory";
import { ListData } from "common/models";
import { ComboBox } from "dashboard/common/form/dropdown";
import { AddToInventory, DealExtData } from "common/models/deals";
import { useLocation } from "react-router-dom";

export const DealRetailTradeSecond = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        dealExtData: {
            Trade2_Color,
            Trade2_Mileage,
            Trade2_Year,
            Trade2_BodyStyle,
            Trade2_Title_Num,
            Trade2_StockNum,
            Trade2_OdomInExcess,
            Trade2_OdomNotActual,
            Trade2_Allowance,
            Trade2_Lien_Payoff,
            Trade2_Lien_Per_Diem,
            Trade2_Lien_Payoff_Good_Through,
            Trade2_Lien_Name,
            Trade2_Lien_Contact,
            Trade2_Lien_Phone,
        },
        deal: { addToInventory },
        changeDealExtData,
        changeAddToInventory,
    } = store;
    const { values, errors, setFieldValue, setFieldTouched } = useFormikContext<PartialDeal>();
    const { pathname, search } = useLocation();
    const currentPath = pathname + search;
    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);
    const [bodyTypeList, setBodyTypeList] = useState<ListData[]>([]);
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);

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
        const makeSting = values.Trade2_Make.toLowerCase().replaceAll(" ", "");
        if (automakesList.some((item) => item.name.toLocaleLowerCase() === makeSting)) {
            getAutoMakeModelList(makeSting).then((list) => {
                if (list && Object.keys(list).length) {
                    setAutomakesModelList(list);
                } else {
                    setAutomakesModelList([]);
                }
            });
        }
    }, [automakesList, values.Trade2_Make]);

    useEffect(() => {
        if (values.Trade2_Make) handleSelectMake();
    }, [handleSelectMake, values.Trade2_Make]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option?.logo || defaultMakesLogo}
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
                    src={option?.logo || defaultMakesLogo}
                    className='mr-2 vehicle__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleChangeFormValue = ({
        key,
        value,
    }: {
        key: keyof DealExtData;
        value: string | number;
    }) => {
        setFieldValue(key, value);
        changeDealExtData({ key, value });
    };

    const handleVINchange = (vinInfo: VehicleDecodeInfo) => {
        if (vinInfo) {
            if (allowOverwrite) {
                handleChangeFormValue({
                    key: "Trade2_Make",
                    value: vinInfo.Make || values.Trade2_Make,
                });
                handleChangeFormValue({
                    key: "Trade2_Model",
                    value: vinInfo.Model || values.Trade2_Model,
                });
                handleChangeFormValue({
                    key: "Trade2_Year",
                    value: vinInfo.Year || values.Trade2_Year,
                });
                handleChangeFormValue({
                    key: "Trade2_BodyStyle",
                    value:
                        bodyTypeList.find((item) => item.id === vinInfo.BodyStyle)?.name ||
                        Trade2_BodyStyle,
                });
                handleChangeFormValue({
                    key: "Trade2_Color",
                    value: vinInfo.ExteriorColor || Trade2_Color,
                });
                handleChangeFormValue({
                    key: "Trade2_Mileage",
                    value: vinInfo.mileage || Trade2_Mileage,
                });
            } else {
                handleChangeFormValue({
                    key: "Trade2_Make",
                    value: values.Trade2_Make || vinInfo.Make,
                });
                handleChangeFormValue({
                    key: "Trade2_Model",
                    value: values.Trade2_Model || vinInfo.Model,
                });
                handleChangeFormValue({
                    key: "Trade2_Year",
                    value: values.Trade2_Year || vinInfo.Year,
                });
                handleChangeFormValue({
                    key: "Trade2_BodyStyle",
                    value:
                        Trade2_BodyStyle ||
                        bodyTypeList.find((item) => item.id === vinInfo.BodyStyle)?.name ||
                        "",
                });
                handleChangeFormValue({
                    key: "Trade2_Color",
                    value: Trade2_Color || vinInfo.ExteriorColor,
                });
                handleChangeFormValue({
                    key: "Trade2_Mileage",
                    value: Trade2_Mileage || vinInfo.mileage,
                });
            }
        }
    };

    const handleMakeChange = useCallback(
        (value: string) => {
            setFieldValue("Trade2_Make", value);
            changeDealExtData({ key: "Trade2_Make", value });
            setAutomakesModelList([]);
        },
        [setFieldValue, changeDealExtData]
    );

    const handleModelChange = useCallback(
        (value: string) => {
            setFieldValue("Trade2_Model", value);
            changeDealExtData({ key: "Trade2_Model", value });
        },
        [setFieldValue, changeDealExtData]
    );

    const isTradeChecked = Boolean(addToInventory & AddToInventory.TRADE_SECOND_ENABLED);
    const toggleTrade = isTradeChecked
        ? addToInventory & ~AddToInventory.TRADE_SECOND_ENABLED
        : addToInventory | AddToInventory.TRADE_SECOND_ENABLED;
    return (
        <div className='grid deal-retail-trade row-gap-2'>
            <div className='col-12'>
                <div className='trade-overwrite pb-3'>
                    <Checkbox
                        checked={allowOverwrite}
                        id='trade-overwrite'
                        className='trade-overwrite__checkbox'
                        onChange={() => setAllowOverwrite(!allowOverwrite)}
                    />
                    <label className='pl-3 trade-overwrite__label'>Overwrite data</label>
                    <i className='icon adms-help trade-overwrite__icon' />
                </div>
            </div>
            <div className='col-6 relative'>
                <VINDecoder
                    value={values.Trade2_VIN}
                    onChange={({ target: { value } }) => {
                        setFieldValue("Trade2_VIN", value);
                        changeDealExtData({ key: "Trade2_VIN", value });
                    }}
                    onAction={handleVINchange}
                    className={`${errors.Trade2_VIN ? "p-invalid" : ""}`}
                />
                <small className='p-error'>{errors.Trade2_VIN || ""}</small>
            </div>
            <div className='col-6 relative'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={values.Trade2_Make}
                    required
                    options={automakesList}
                    onChange={({ value }) => handleMakeChange(value)}
                    editable
                    valueTemplate={selectedAutoMakesTemplate}
                    itemTemplate={autoMakesOptionTemplate}
                    className={`deal-trade__dropdown w-full ${
                        errors.Trade2_Make ? "p-invalid" : ""
                    }`}
                    label='Make (required)'
                />

                <small className='p-error'>{errors.Trade2_Make || ""}</small>
            </div>

            <div className='col-6 relative'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={values.Trade2_Model}
                    editable
                    options={automakesModelList}
                    onChange={({ value }) => handleModelChange(value)}
                    className={`deal-trade__dropdown w-full ${errors.Trade2_Model ? "p-invalid" : ""}`}
                    label='Model (required)'
                />
                <small className='p-error'>{errors.Trade2_Model}</small>
            </div>
            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        className={`deal-trade__text-input w-full ${
                            errors.Trade2_Year ? "p-invalid" : ""
                        }`}
                        required
                        min={0}
                        useGrouping={false}
                        value={parseInt(Trade2_Year) || null}
                        onChange={({ value }) => {
                            if (!value) {
                                return changeDealExtData({ key: "Trade2_Year", value: "" });
                            }
                            setFieldValue("Trade2_Year", value);
                            changeDealExtData({ key: "Trade2_Year", value: String(value) });
                        }}
                    />
                    <label className='float-label'>Year (required)</label>
                </span>
                <small className='p-error'>{errors.Trade2_Year}</small>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        className={`deal-trade__text-input w-full ${errors.Trade2_Mileage ? "p-invalid" : ""}`}
                        required
                        value={
                            values.Trade2_Mileage
                                ? parseFloat(values.Trade2_Mileage.replace(/[^0-9.]/g, ""))
                                : null
                        }
                        useGrouping
                        min={0}
                        onChange={({ value }) => {
                            const valAsString = value?.toString() || "";
                            setFieldValue("Trade2_Mileage", valAsString);
                            changeDealExtData({
                                key: "Trade2_Mileage",
                                value: valAsString,
                            });
                        }}
                    />
                    <label className='float-label'>Mileage (required)</label>
                </span>

                <small className='p-error'>{errors.Trade2_Mileage || ""}</small>
            </div>
            <div className='col-3'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={Trade2_Color}
                    options={colorList}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Trade2_Color", value })
                    }
                    className='w-full deal-trade__dropdown'
                    label='Color'
                />
            </div>

            <div className='col-3'>
                <ComboBox
                    optionLabel='name'
                    optionValue='name'
                    value={Trade2_BodyStyle}
                    onChange={({ target: { value } }) => {
                        changeDealExtData({ key: "Trade2_BodyStyle", value });
                    }}
                    editable
                    options={bodyTypeList}
                    className='w-full deal-trade__dropdown'
                    label='Body Style'
                />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        value={Trade2_Title_Num}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_Title_Num", value });
                        }}
                        className='deal-trade__text-input w-full'
                    />
                    <label className='float-label'>Title#</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        value={Trade2_StockNum}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_StockNum", value });
                        }}
                        className='deal-trade__text-input w-full'
                    />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>

            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId='Trade2_OdomInExcess'
                    name='Trade2_OdomInExcess'
                    checked={!!Trade2_OdomInExcess}
                    onChange={() =>
                        changeDealExtData({
                            key: "Trade2_OdomInExcess",
                            value: Number(!Trade2_OdomInExcess),
                        })
                    }
                />
                <label htmlFor='Trade2_OdomInExcess' className='ml-2'>
                    Disclosure IN EXCESS
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId='Trade2_OdomNotActual'
                    name='Trade2_OdomNotActual'
                    checked={!!Trade2_OdomNotActual}
                    onChange={() =>
                        changeDealExtData({
                            key: "Trade2_OdomNotActual",
                            value: Number(!Trade2_OdomNotActual),
                        })
                    }
                />
                <label htmlFor='Trade2_OdomNotActual' className='ml-2'>
                    Disclosure NOT ACTUAL
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId='Trade2_AddToInventory'
                    name='Trade2_AddToInventory'
                    checked={isTradeChecked}
                    onChange={() => changeAddToInventory(toggleTrade)}
                />
                <label htmlFor='Trade2_AddToInventory' className='ml-2'>
                    Add to inventory
                </label>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Allowance) || 0}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Allowance", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Allowance'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Lien_Payoff) || 0}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Lien_Payoff", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Lien_Per_Diem) || 0}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Lien_Per_Diem", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Per Diem'
                />
            </div>
            <div className='col-3'>
                <DateInput
                    date={Trade2_Lien_Payoff_Good_Through}
                    checkbox
                    checked={!!Trade2_Lien_Payoff_Good_Through}
                    onCheckboxChange={() => {
                        const isChecked = !Trade2_Lien_Payoff_Good_Through;
                        if (isChecked) {
                            changeDealExtData({
                                key: "Trade2_Lien_Payoff_Good_Through",
                                value: Number(Trade2_Lien_Payoff_Good_Through) || Date.now(),
                            });
                        } else {
                            changeDealExtData({
                                key: "Trade2_Lien_Payoff_Good_Through",
                                value: "",
                            });
                        }
                        store.isFormChanged = true;
                    }}
                    onChange={({ value }) =>
                        value &&
                        changeDealExtData({
                            key: "Trade2_Lien_Payoff_Good_Through",
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
                    value={Trade2_Lien_Name}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Trade2_Lien_Name", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "Trade2_Lien_Name",
                            value,
                        })
                    }
                />
            </div>
            <div className='col-6 relative'>
                <span className='p-float-label'>
                    <InputText
                        className={`'deal-trade__text-input w-full' ${
                            errors.Trade2_Lien_Address ? "p-invalid" : ""
                        }`}
                        value={values.Trade2_Lien_Address}
                        onChange={async ({ target: { value } }) => {
                            await setFieldValue("Trade2_Lien_Address", value);
                            setFieldTouched("Trade2_Lien_Address", true);
                            changeDealExtData({ key: "Trade2_Lien_Address", value });
                        }}
                        onBlur={() => setFieldTouched("Trade2_Lien_Address", true, true)}
                    />
                    <label className='float-label'>Mailing address</label>
                </span>
                <small className='p-error'>{errors.Trade2_Lien_Address}</small>
            </div>

            <div className='col-3'>
                <PhoneInput
                    name='Phone Number'
                    value={Trade2_Lien_Phone}
                    onChange={({ target: { value } }) => {
                        setFieldValue("Trade2_Lien_Phone", value.replace(/[^0-9]/g, ""));
                        changeDealExtData({ key: "Trade2_Lien_Phone", value: value ?? "" });
                    }}
                />
            </div>
            <div className='col-6'>
                <CompanySearch
                    originalPath={currentPath}
                    value={Trade2_Lien_Contact}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Trade2_Lien_Contact", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "Trade2_Lien_Contact",
                            value,
                        })
                    }
                    name='Contact'
                />
            </div>
        </div>
    );
});
