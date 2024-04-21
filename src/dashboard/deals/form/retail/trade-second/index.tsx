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

export const DealRetailTradeSecond = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        dealExtData: {
            Trade2_VIN,
            Trade2_Make,
            Trade2_Model,
            Trade2_Year,
            Trade2_Mileage,
            Trade2_Color,
            Trade2_BodyStyle,
            Trade2_Title_Num,
            Trade2_StockNum,
            Trade2_OdomInExcess,
            Trade2_OdomNotActual,
            Trade2_Allowance,
            Trade2_Lien_Payoff,
            Trade2_Lien_Payoff_Good_Through,
            Trade2_Lien_Name,
            Trade2_Lien_Address,
            Trade2_Lien_Phone,
            Trade2_Lien_Contact,
            Trade2_Title_To,
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
            VIN: Trade2_VIN || "",
            Make: Trade2_Make || "",
            Model: Trade2_Model || "",
            Year: Trade2_Year || "",
            mileage: Trade2_Mileage || "",
        },
        enableReinitialize: true,
        validate: (data) => {
            let errors: any = {};

            if (!data.VIN) {
                errors.VIN = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade2_VIN", value: data.VIN });
            }

            if (!data.Make) {
                errors.Make = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade2_Make", value: data.Make });
            }

            if (!data.Model) {
                errors.Model = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade2_Model", value: data.Model });
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
                changeDealExtData({ key: "Trade2_Year", value: data.Year });
            }

            if (!data.mileage) {
                errors.mileage = "Data is required.";
            } else {
                changeDealExtData({ key: "Trade2_Mileage", value: data.mileage });
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
                        value={Trade2_Color}
                        filter
                        options={colorList}
                        onChange={({ target: { value } }) =>
                            changeDealExtData({ key: "Trade2_Color", value })
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
                        value={Trade2_BodyStyle}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_BodyStyle", value });
                        }}
                        editable
                        options={[{ name: Trade2_BodyStyle }]}
                        filter
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Body Style</label>
                </span>
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
                {/* TODO: Add checkbox for adding to inventory */}
                <Checkbox
                    inputId='Trade2_AddToInventory'
                    name='Trade2_AddToInventory'
                    checked={false}
                />
                <label htmlFor='Trade2_AddToInventory' className='ml-2'>
                    Add to inventory
                </label>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Allowance)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Allowance", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Allowance'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Lien_Payoff)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Lien_Payoff", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            <div className='col-3'>
                <CurrencyInput
                    value={Number(Trade2_Lien_Payoff)}
                    onChange={({ value }) => {
                        changeDealExtData({ key: "Trade2_Lien_Payoff", value: value || 0 });
                    }}
                    labelPosition='top'
                    title='Payoff Amount'
                />
            </div>
            {/* TODO: Add calendar checkbox */}
            <div className='col-3'>
                <DateInput
                    date={Trade2_Lien_Payoff_Good_Through}
                    onChange={({ value }) =>
                        value &&
                        changeDealExtData({
                            key: "Trade2_Lien_Payoff_Good_Through",
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
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-trade__text-input w-full'
                        value={Trade2_Lien_Address}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_Lien_Address", value });
                        }}
                    />
                    <label className='float-label'>Mailing address</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-trade__text-input w-full'
                        value={Trade2_Lien_Phone}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_Lien_Phone", value });
                        }}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <CompanySearch
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
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        //TODO: add options
                        value={Trade2_Title_To}
                        onChange={({ target: { value } }) => {
                            changeDealExtData({ key: "Trade2_Title_To", value });
                        }}
                        editable
                        options={[{ name: Trade2_Title_To }]}
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Vehicle is Titled to</label>
                </span>
            </div>
        </div>
    );
});
