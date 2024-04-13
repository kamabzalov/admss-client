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

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear();

export const DealRetailTradeFirst = observer((): ReactElement => {
    const mileage = 0;

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
                        className='mr-2 deal-trade__dropdown-icon'
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
                    className='mr-2 deal-trade__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const formik = useFormik({
        initialValues: {
            VIN: "",
            Make: "",
            Model: "",
            Year: String(""),
            mileage: "",
        },
        enableReinitialize: true,
        validate: (data) => {
            let errors: any = {};

            if (!data.VIN) {
                errors.VIN = "Data is required.";
            } else {
            }

            if (!data.Make) {
                errors.Make = "Data is required.";
            } else {
            }

            if (!data.Model) {
                errors.Model = "Data is required.";
            } else {
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
            }

            if (!data.mileage) {
                errors.mileage = "Data is required.";
            } else {
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
                        onChange={({ value }) => {}}
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
                        filter
                        options={colorList}
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Color</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Body Style</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-trade__text-input w-full' />
                    <label className='float-label'>Title#</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-trade__text-input w-full' />
                    <label className='float-label'>Stock#</label>
                </span>
            </div>

            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox inputId={`trade`} name={`trade`} checked={false} />
                <label htmlFor={`trade`} className='ml-2'>
                    Disclosure IN EXCESS
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox inputId={`trade`} name={`trade`} checked={false} />
                <label htmlFor={`trade`} className='ml-2'>
                    Disclosure NOT ACTUAL
                </label>
            </div>
            <div className='col-3 deal-trade__checkbox flex align-items-center'>
                <Checkbox inputId={`trade`} name={`trade`} checked={false} />
                <label htmlFor={`trade`} className='ml-2'>
                    Add to inventory
                </label>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Allowance' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Payoff Amount' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Payoff Amount' />
            </div>
            {/* TODO: Add calendar checkbox */}
            <div className='col-3'>
                <DateInput name='PO Good Thru' />
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch name='Lienholder Name' />
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='deal-trade__text-input w-full' />
                    <label className='float-label'>Mailing address</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-trade__text-input w-full' />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <CompanySearch name='Contact' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-trade__dropdown'
                    />
                    <label className='float-label'>Vehicle is Titled to</label>
                </span>
            </div>
        </div>
    );
});
