import { ReactElement } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { FormikErrors } from "formik";
import { NumberInput, TextInput } from "dashboard/common/form/inputs";
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
                <TextInput
                    name='Make'
                    value={values.make}
                    onChange={(e) => setFieldValue("make", e.target.value)}
                    colWidth={6}
                    error={Boolean(errors.make)}
                    errorMessage={errors.make}
                />
            </div>

            <div className='grid lead-row pt-3'>
                <TextInput
                    name='Model'
                    value={values.model}
                    onChange={(e) => setFieldValue("model", e.target.value)}
                    colWidth={6}
                    error={Boolean(errors.model)}
                    errorMessage={errors.model}
                />
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
                    <NumberInput
                        key='desiredPrice'
                        name='Desired Price'
                        value={values.desiredPrice}
                        onValueChange={(e) => setFieldValue("desiredPrice", e.value ?? null)}
                        colWidth={3}
                        min={0}
                        useGrouping
                        error={Boolean(errors.desiredPrice)}
                        errorMessage={errors.desiredPrice}
                    />
                    <NumberInput
                        key='payoffAmount'
                        name='Payoff Amount'
                        value={values.payoffAmount}
                        onValueChange={(e) => setFieldValue("payoffAmount", e.value ?? null)}
                        colWidth={3}
                        min={0}
                        useGrouping
                        error={Boolean(errors.payoffAmount)}
                        errorMessage={errors.payoffAmount}
                    />
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
