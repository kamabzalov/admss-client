import { ReactElement } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { FormikErrors } from "formik";
import { formatDateForServer } from "common/helpers";
import { ComboBox } from "dashboard/common/form/dropdown";
import {
    DateInput,
    EmailInput,
    PhoneInput,
    StateDropdown,
    TextInput,
} from "dashboard/common/form/inputs";
import {
    LEAD_STATUS_OPTIONS,
    LEAD_TYPE_OPTIONS,
    LeadFormValues,
    VISIT_TYPE_OPTIONS,
} from "../types";
import { isContactStepValid } from "dashboard/leads/form/helpers";
import { ConvertButton } from "dashboard/leads/form/common/convert-button";
import { Splitter } from "dashboard/common/display";

interface ContactInformationStepProps {
    values: LeadFormValues;
    errors: FormikErrors<LeadFormValues>;
    setFieldValue: (field: string, value: unknown) => void;
    onConvert?: () => void;
}

export const ContactInformationStep = ({
    values,
    errors,
    setFieldValue,
    onConvert,
}: ContactInformationStepProps): ReactElement => {
    const isTradeIn = values.type === "trade-in";
    const isService = values.type === "service";
    const hasType = Boolean(values.type);
    const textareaLabel = isService ? "Comments" : "Message to Dealer";

    return (
        <>
            <div key='top' className='lead-form__top'>
                <div className='lead-form__title uppercase'>Contact Information</div>
                {isTradeIn && (
                    <ConvertButton
                        label='Convert to Contact'
                        disabled={!isContactStepValid(values)}
                        onClick={onConvert}
                    />
                )}
            </div>

            <div key='type-status' className='grid lead-row pt-3'>
                <div className='col-4'>
                    <ComboBox
                        label='Type (required)'
                        options={LEAD_TYPE_OPTIONS}
                        value={values.type}
                        onChange={(e) => setFieldValue("type", e.value || "")}
                        optionLabel='label'
                        optionValue='value'
                        error={Boolean(errors.type)}
                        errorMessage={errors.type}
                    />
                </div>
                {hasType && (
                    <div key='status' className='col-4'>
                        <ComboBox
                            label='Status'
                            options={LEAD_STATUS_OPTIONS}
                            value={values.status}
                            onChange={(e) => setFieldValue("status", e.value || "")}
                            optionLabel='label'
                            optionValue='value'
                            error={Boolean(errors.status)}
                            errorMessage={errors.status}
                        />
                    </div>
                )}
            </div>

            {hasType && (
                <>
                    <Splitter className='py-3 mb-3' />

                    {isTradeIn ? (
                        <div className='lead-row'>
                            <div key='tradein-row-1' className='grid lead-row pb-3'>
                                <TextInput
                                    key='firstName'
                                    name='First Name (required)'
                                    value={values.firstName}
                                    onChange={(e) => setFieldValue("firstName", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.firstName)}
                                    errorMessage={errors.firstName}
                                />
                                <TextInput
                                    key='lastName'
                                    name='Last Name (required)'
                                    value={values.lastName}
                                    onChange={(e) => setFieldValue("lastName", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.lastName)}
                                    errorMessage={errors.lastName}
                                />
                                <div key='state' className='col-4'>
                                    <StateDropdown
                                        name='DL`s State'
                                        value={values.state}
                                        onChange={(e) =>
                                            setFieldValue("state", String(e.value || ""))
                                        }
                                        filter
                                    />
                                </div>
                            </div>

                            <div key='tradein-row-2' className='grid lead-row'>
                                <TextInput
                                    key='city'
                                    name='City'
                                    value={values.city}
                                    onChange={(e) => setFieldValue("city", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.city)}
                                    errorMessage={errors.city}
                                />
                                <EmailInput
                                    key='email'
                                    name='E-mail (required)'
                                    value={values.email}
                                    onChange={(e) => setFieldValue("email", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.email)}
                                    errorMessage={errors.email}
                                />
                                <PhoneInput
                                    key='phone'
                                    name='Phone Number (required)'
                                    value={values.phone}
                                    onChange={(e) => setFieldValue("phone", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.phone)}
                                    errorMessage={errors.phone}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className='lead-row pb-3'>
                            <div key='other-row-1' className='grid pb-3'>
                                <TextInput
                                    key='firstName'
                                    name='First Name (required)'
                                    value={values.firstName}
                                    onChange={(e) => setFieldValue("firstName", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.firstName)}
                                    errorMessage={errors.firstName}
                                />
                                <TextInput
                                    key='lastName'
                                    name='Last Name (required)'
                                    value={values.lastName}
                                    onChange={(e) => setFieldValue("lastName", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.lastName)}
                                    errorMessage={errors.lastName}
                                />
                                <EmailInput
                                    key='email'
                                    name='E-mail (required)'
                                    value={values.email}
                                    onChange={(e) => setFieldValue("email", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.email)}
                                    errorMessage={errors.email}
                                />
                            </div>

                            <div key='other-row-2' className='grid'>
                                <PhoneInput
                                    key='phone'
                                    name='Phone Number (required)'
                                    value={values.phone}
                                    onChange={(e) => setFieldValue("phone", e.target.value)}
                                    colWidth={4}
                                    error={Boolean(errors.phone)}
                                    errorMessage={errors.phone}
                                />
                                {isService && (
                                    <>
                                        <DateInput
                                            key='preferredDateTime'
                                            name='Preferred Date&Time (required)'
                                            value={
                                                values.preferredDateTime
                                                    ? new Date(values.preferredDateTime)
                                                    : undefined
                                            }
                                            emptyDate
                                            showTime
                                            hourFormat='12'
                                            onChange={(e) =>
                                                setFieldValue(
                                                    "preferredDateTime",
                                                    e.value
                                                        ? formatDateForServer(e.value as Date)
                                                        : ""
                                                )
                                            }
                                            colWidth={4}
                                            error={Boolean(errors.preferredDateTime)}
                                            errorMessage={errors.preferredDateTime}
                                        />
                                        <div key='waitOrDropOff' className='col-4'>
                                            <ComboBox
                                                label='Wait or Drop Off'
                                                options={VISIT_TYPE_OPTIONS}
                                                value={values.waitOrDropOff}
                                                onChange={(e) =>
                                                    setFieldValue("waitOrDropOff", e.value || "")
                                                }
                                                optionLabel='label'
                                                optionValue='value'
                                                error={Boolean(errors.waitOrDropOff)}
                                                errorMessage={errors.waitOrDropOff}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div key='message' className='lead-textarea-wrap'>
                        <span className='p-float-label'>
                            <InputTextarea
                                id='lead-contact-note'
                                className='w-full lead-textarea'
                                rows={4}
                                value={values.message}
                                onChange={(e) => setFieldValue("message", e.target.value)}
                            />
                            <label htmlFor='lead-contact-note' className='float-label'>
                                {textareaLabel}
                            </label>
                        </span>
                    </div>
                </>
            )}
        </>
    );
};
