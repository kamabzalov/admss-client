import { observer } from "mobx-react-lite";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import {
    ListData,
    MakesListData,
    getInventoryAutomakesList,
    getInventoryExteriorColorsList,
} from "http/services/inventory-service";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { useFormik } from "formik";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear();
const mileage = 0;

export const DealRetailTradeFirst = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        dealExtData: {
            Trade1_VIN,
            Trade1_Make,
            Trade1_Model,
            Trade1_Year,
            Trade1_Mileage,
            Trade1_Color,
            Trade1_BodyStyle,
            Trade1_Title_Num,
            Trade1_StockNum,
            Trade1_OdomInExcess,
            Trade1_OdomNotActual,
            Trade1_Allowance,
            Trade1_Lien_Payoff,
            Trade1_Lien_Payoff_Good_Through,
            Trade1_Lien_Name,
            Trade1_Lien_Address,
            Trade1_Lien_Phone,
            Trade1_Lien_Contact,
        },
        changeDealExtData,
    } = store;

    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList] = useState<ListData[]>([]);
    const [colorList, setColorList] = useState<ListData[]>([]);

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
    }, []);

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

    const formik = useFormik({
        initialValues: {
            VIN: Trade1_VIN || "",
            Make: Trade1_Make || "",
            Model: Trade1_Model || "",
            Year: Trade1_Year || "",
            mileage: Trade1_Mileage || "",
        },
        enableReinitialize: true,
        validate: (data) => {
            let errors: any = {};

            if (!data.VIN) {
                errors.VIN = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade1_VIN", value: data.VIN });
            }

            if (!data.Make) {
                errors.Make = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade1_Make", value: data.Make });
            }

            if (!data.Model) {
                errors.Model = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade1_Model", value: data.Model });
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
            } else {
                changeDealExtData({ key: "Trade1_Year", value: data.Year });
            }

            if (!data.mileage) {
                errors.mileage = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade1_Mileage", value: data.mileage });
            }

            return errors;
        },
        onSubmit: () => {},
    });

    return (
        <div className='grid deal-retail-trade row-gap-2'>
            <div className='col-6 relative'>
                <span className='p-float-label'>
                    {/* TODO: Add DECODE button */}
                    <InputText
                        {...formik.getFieldProps("VIN")}
                        className={`deal-trade__text-input w-full ${
                            formik.touched.VIN && formik.errors.VIN && "p-invalid"
                        }`}
                        value={formik.values.VIN}
                        onChange={({ target: { value } }) => {
                            formik.setFieldValue("VIN", value);
                        }}
                    />
                    <label className='float-label'>VIN (required)</label>
                </span>
                <small className='p-error'>{(formik.touched.VIN && formik.errors.VIN) || ""}</small>
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
                        onChange={({ value }) => formik.setFieldValue("Make", value)}
                        valueTemplate={selectedAutoMakesTemplate}
                        itemTemplate={autoMakesOptionTemplate}
                        className={`deal-trade__dropdown w-full ${
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
                        onChange={({ value }) => formik.setFieldValue("Model", value)}
                        className={`deal-trade__dropdown w-full ${
                            formik.touched.Model && formik.errors.Model && "p-invalid"
                        }`}
                    />
                    <label className='float-label'>Model (required)</label>
                </span>
                <small className='p-error'>
                    {(formik.touched.Model && formik.errors.Model) || ""}
                </small>
            </div>
            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        {...formik.getFieldProps("Year")}
                        className={`deal-trade__text-input w-full ${
                            formik.touched.Year && formik.errors.Year && "p-invalid"
                        }`}
                        required
                        min={0}
                        value={MIN_YEAR}
                        useGrouping={false}
                        onChange={({ value }) => formik.setFieldValue("Year", value)}
                    />
                    <label className='float-label'>Year (required)</label>
                </span>
                <small className='p-error'>
                    {(formik.touched.Year && formik.errors.Year) || ""}
                </small>
            </div>

            <div className='col-3 relative'>
                <span className='p-float-label'>
                    <InputNumber
                        {...formik.getFieldProps("mileage")}
                        className={`deal-trade__text-input w-full ${
                            formik.touched.mileage && formik.errors.mileage && "p-invalid"
                        }`}
                        required
                        value={mileage}
                        minFractionDigits={2}
                        min={0}
                        onChange={({ value }) => formik.setFieldValue("mileage", value)}
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
                        value={Trade1_Color}
                        filter
                        options={colorList}
                        onChange={({ target: { value } }) =>
                            changeDealExtData({ key: "Trade1_Color", value })
                        }
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Color</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        //TODO: add options
                        optionLabel='name'
                        optionValue='name'
                        value={Trade1_BodyStyle}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade1_BodyStyle", value });
                        }}
                        editable
                        options={[{ name: Trade1_BodyStyle }]}
                        filter
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Body Style</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        value={Trade1_Title_Num}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade1_Title_Num", value });
                        }}
                        className='deal-trade__text-input w-full'
                    />
                    <label className='float-label'>Title#</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        value={Trade1_StockNum}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade1_StockNum", value });
                        }}
                        className='deal-trade__text-input w-full'
                    />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>

            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId='Trade1_OdomInExcess'
                    name='Trade1_OdomInExcess'
                    checked={!!Trade1_OdomInExcess}
                    onChange={() =>
                        changeDealExtData({
                            key: "Trade1_OdomInExcess",
                            value: Number(!Trade1_OdomInExcess),
                        })
                    }
                />
                <label htmlFor='Trade1_OdomInExcess' className='ml-2'>
                    Disclosure IN EXCESS
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox
                    inputId='Trade1_OdomNotActual'
                    name='Trade1_OdomNotActual'
                    checked={!!Trade1_OdomNotActual}
                    onChange={() =>
                        changeDealExtData({
                            key: "Trade1_OdomNotActual",
                            value: Number(!Trade1_OdomNotActual),
                        })
                    }
                />
                <label htmlFor='Trade1_OdomNotActual' className='ml-2'>
                    Disclosure NOT ACTUAL
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                {/* TODO: Add checkbox for adding to inventory */}
                <Checkbox
                    inputId='Trade1_AddToInventory'
                    name='Trade1_AddToInventory'
                    checked={false}
                />
                <label htmlFor='Trade1_AddToInventory' className='ml-2'>
                    Add to inventory
                </label>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade1_Allowance)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade1_Allowance", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Allowance'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade1_Lien_Payoff)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade1_Lien_Payoff", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade1_Lien_Payoff)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade1_Lien_Payoff", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            {/* TODO: Add calendar checkbox */}
            <div className='col-3'>
                <DateInput
                    date={Trade1_Lien_Payoff_Good_Through}
                    onChange={({ value }) =>
                        value &&
                        changeDealExtData({
                            key: "Trade1_Lien_Payoff_Good_Through",
                            value: Number(value),
                        })
                    }
                    name='PO Good Thru'
                />
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch
                    name='Lienholder Name'
                    value={Trade1_Lien_Name}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Trade1_Lien_Name", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "Trade1_Lien_Name",
                            value,
                        })
                    }
                />
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-trade__text-input w-full'
                        value={Trade1_Lien_Address}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade1_Lien_Address", value });
                        }}
                    />
                    <label className='float-label'>Mailing address</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-trade__text-input w-full'
                        value={Trade1_Lien_Phone}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade1_Lien_Phone", value });
                        }}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <CompanySearch
                    value={Trade1_Lien_Contact}
                    onChange={({ target: { value } }) =>
                        changeDealExtData({ key: "Trade1_Lien_Contact", value })
                    }
                    onRowClick={(value) =>
                        changeDealExtData({
                            key: "Trade1_Lien_Contact",
                            value,
                        })
                    }
                    name='Contact'
                />
            </div>
        </div>
    );
});
