import { ReactElement, useCallback, useEffect, useState } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { DropdownProps } from "primereact/dropdown";
import { FormikErrors } from "formik";
import { CurrencyInput, TextInput } from "dashboard/common/form/inputs";
import { ComboBox } from "dashboard/common/form/dropdown";
import { getAutoMakeModelList, getInventoryAutomakesList } from "http/services/inventory-service";
import { MakesListData } from "common/models/inventory";
import { ListData } from "common/models";
import defaultMakesLogo from "assets/images/default-makes-logo.svg";
import { LeadFormValues } from "../types";
import { isVehicleStepValid } from "../helpers";
import { ConvertButton } from "../common/convert-button";

interface VehicleInformationStepProps {
    values: LeadFormValues;
    errors: FormikErrors<LeadFormValues>;
    setFieldValue: (field: string, value: unknown) => void;
    onConvert?: () => void;
}

export const VehicleInformationStep = ({
    values,
    errors,
    setFieldValue,
    onConvert,
}: VehicleInformationStepProps): ReactElement => {
    const isTradeIn = values.type === "trade-in";

    const [automakesList, setAutomakesList] = useState<MakesListData[]>([]);
    const [automakesModelList, setAutomakesModelList] = useState<ListData[]>([]);

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
    }, []);

    const handleSelectMake = useCallback(() => {
        const makeString = values.make.toLowerCase().replaceAll(" ", "");
        if (automakesList.some((item) => item.name.toLocaleLowerCase() === makeString)) {
            getAutoMakeModelList(makeString).then((list) => {
                if (list && Object.keys(list).length) {
                    setAutomakesModelList(list);
                } else {
                    setAutomakesModelList([]);
                }
            });
        }
    }, [automakesList, values.make]);

    useEffect(() => {
        if (values.make) {
            handleSelectMake();
        }
    }, [values.make, handleSelectMake]);

    const selectedAutoMakesTemplate = (option: MakesListData, props: DropdownProps) => {
        if (option) {
            return (
                <div className='flex align-items-center'>
                    <img
                        alt={option.name}
                        src={option.logo || defaultMakesLogo}
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
                    src={option.logo || defaultMakesLogo}
                    className='mr-2 vehicle-general__dropdown-icon'
                />
                <div>{option.name}</div>
            </div>
        );
    };

    const handleMakeChange = (value: string) => {
        setFieldValue("make", value);
        setAutomakesModelList([]);
    };

    const handleModelChange = (value: string) => {
        setFieldValue("model", value);
    };

    return (
        <>
            <div className='lead-form__top'>
                <div className='lead-form__title uppercase'>Vehicle Information</div>
                {isTradeIn && (
                    <ConvertButton
                        label='Convert to Inventory'
                        disabled={!isVehicleStepValid(values)}
                        onClick={onConvert}
                    />
                )}
            </div>

            <div className='grid lead-row pt-3'>
                <TextInput
                    name='VIN'
                    value={values.vin}
                    onChange={(e) => setFieldValue("vin", e.target.value)}
                    colWidth={6}
                    error={Boolean(errors.vin)}
                    errorMessage={errors.vin}
                />
                <div className='col-6 relative'>
                    <ComboBox
                        optionLabel='name'
                        optionValue='name'
                        value={values.make}
                        required
                        options={automakesList}
                        onChange={({ value }) => handleMakeChange(value)}
                        valueTemplate={selectedAutoMakesTemplate}
                        itemTemplate={autoMakesOptionTemplate}
                        className='vehicle-general__dropdown w-full'
                        label='Make'
                        editable
                        error={Boolean(errors.make)}
                        errorMessage={errors.make}
                    />
                </div>
            </div>

            <div className='grid lead-row pt-3'>
                <div className='col-6 relative'>
                    <ComboBox
                        optionLabel='name'
                        optionValue='name'
                        value={values.model}
                        required
                        options={automakesModelList}
                        onChange={({ value }) => handleModelChange(value)}
                        className='vehicle-general__dropdown w-full'
                        label='Model'
                        editable
                        error={Boolean(errors.model)}
                        errorMessage={errors.model}
                    />
                </div>
                <TextInput
                    name='Year'
                    value={values.year}
                    onChange={(e) => setFieldValue("year", e.target.value)}
                    colWidth={3}
                    error={Boolean(errors.year)}
                    errorMessage={errors.year}
                />
                <TextInput
                    name='Mileage'
                    value={values.mileage}
                    onChange={(e) => setFieldValue("mileage", e.target.value)}
                    colWidth={3}
                    error={Boolean(errors.mileage)}
                    errorMessage={errors.mileage}
                />
            </div>

            {isTradeIn && (
                <div key='trade-in-row' className='grid lead-row pt-3'>
                    <div className='col-3'>
                        <CurrencyInput
                            key='desiredPrice'
                            name='Desired Price'
                            title='Desired Price'
                            labelPosition='top'
                            value={values.desiredPrice}
                            onValueChange={(e) => setFieldValue("desiredPrice", e.value ?? null)}
                            error={Boolean(errors.desiredPrice)}
                            errorMessage={errors.desiredPrice}
                        />
                    </div>
                    <div className='col-3'>
                        <CurrencyInput
                            key='payoffAmount'
                            name='Payoff Amount'
                            title='Payoff Amount'
                            labelPosition='top'
                            value={values.payoffAmount}
                            onValueChange={(e) => setFieldValue("payoffAmount", e.value ?? null)}
                            error={Boolean(errors.payoffAmount)}
                            errorMessage={errors.payoffAmount}
                        />
                    </div>
                </div>
            )}

            <div className='lead-textarea-wrap'>
                <span className='p-float-label'>
                    <InputTextarea
                        id='lead-vehicle-note'
                        className='w-full lead-textarea'
                        rows={5}
                        value={values.vehicleAdditionalInfo}
                        onChange={(e) => setFieldValue("vehicleAdditionalInfo", e.target.value)}
                    />
                    <label htmlFor='lead-vehicle-note' className='float-label'>
                        Additional Information
                    </label>
                </span>
            </div>
        </>
    );
};
