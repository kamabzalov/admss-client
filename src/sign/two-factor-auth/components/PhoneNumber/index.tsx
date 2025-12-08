import { Button } from "primereact/button";
import { FormikProps } from "formik";
import { observer } from "mobx-react-lite";
import { PhoneInput } from "dashboard/common/form/inputs";
import { ProgressIndicator } from "../ProgressIndicator";

interface TwoFactorAuthForm {
    phoneNumber: string;
    verificationCode: string[];
    backupCodes: string[];
}

interface PhoneNumberStepProps {
    formik: FormikProps<TwoFactorAuthForm>;
}

export const PhoneNumberStep = observer(({ formik }: PhoneNumberStepProps) => {
    return (
        <>
            <ProgressIndicator currentStep={1} />
            <h1 className='two-factor-auth__title'>Add Your Number</h1>
            <p className='two-factor-auth__description'>
                Enter your phone number, and we'll send you a verification code via text message.
            </p>
            <form onSubmit={formik.handleSubmit}>
                <div className='two-factor-auth__input space pt-2 pb-2'>
                    <PhoneInput
                        name='Phone number'
                        className={`sign__input ${
                            formik.touched.phoneNumber && formik.errors.phoneNumber
                                ? "p-invalid"
                                : ""
                        }`}
                        id='phoneNumber'
                        onChange={(e) => {
                            formik.handleChange(e);
                            formik.setFieldTouched("phoneNumber", true, false);
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.phoneNumber}
                        mask='(999) 999-9999'
                    />
                    {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                        <small className='p-error error-space'>{formik.errors.phoneNumber}</small>
                    ) : null}
                </div>
                <Button
                    label='Continue'
                    severity={
                        !formik.errors.phoneNumber && formik.values.phoneNumber
                            ? "success"
                            : "secondary"
                    }
                    disabled={!formik.values.phoneNumber || !!formik.errors.phoneNumber}
                    type='submit'
                    className='two-factor-auth__button mt-4'
                />
            </form>
        </>
    );
});
