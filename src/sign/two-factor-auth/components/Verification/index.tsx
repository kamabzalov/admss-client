import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormikProps } from "formik";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { ProgressIndicator } from "../ProgressIndicator";

interface TwoFactorAuthForm {
    phoneNumber: string;
    verificationCode: string[];
    backupCodes: string[];
}

interface VerificationCodeStepProps {
    formik: FormikProps<TwoFactorAuthForm>;
}

export const VerificationCodeStep = observer(({ formik }: VerificationCodeStepProps) => {
    const twoFactorAuthStore = useStore().userStore.twoFactorAuth;

    const formatPhoneNumber = (phone: string): string => {
        const digits = phone.replace(/\D/g, "");
        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }
        return phone;
    };

    const handleCodeChange = (index: number, value: string) => {
        const currentValue = twoFactorAuthStore.verificationCode[index];
        if (currentValue && value.length > 0 && value !== currentValue) {
            const newChar = value.replace(/\D/g, "").slice(-1);
            if (newChar) {
                twoFactorAuthStore.handleCodeChange(index, newChar);
            }
        } else if (!currentValue) {
            const newChar = value.replace(/\D/g, "").slice(-1);
            if (newChar) {
                twoFactorAuthStore.handleCodeChange(index, newChar);
            }
        }
        formik.setFieldValue("verificationCode", twoFactorAuthStore.verificationCode);
    };

    const handleFocus = (_: number, e: React.FocusEvent<HTMLInputElement>) => {
        const input = e.target;
        if (input.value) {
            setTimeout(() => {
                input.setSelectionRange(0, 1);
            }, 0);
        }
    };

    return (
        <>
            <ProgressIndicator currentStep={2} />
            <h1 className='two-factor-auth__title'>Authentication</h1>
            <p className='two-factor-auth__description two-factor-auth__description--verification'>
                Enter the code we just sent <br /> to &nbsp;
                {twoFactorAuthStore.phoneNumber
                    ? formatPhoneNumber(twoFactorAuthStore.phoneNumber)
                    : "your phone"}
                &nbsp; to verify your identity.
            </p>
            <form className='auth-verification' onSubmit={formik.handleSubmit}>
                <div className='two-factor-auth__code-inputs'>
                    {twoFactorAuthStore.verificationCode.map((code, index) => (
                        <InputText
                            key={index}
                            ref={(el) => twoFactorAuthStore.setCodeInputRef(index, el)}
                            value={code}
                            onChange={(e) => {
                                handleCodeChange(index, e.target.value);
                                formik.setFieldTouched("verificationCode", true, false);
                            }}
                            onFocus={(e) => handleFocus(index, e)}
                            onKeyDown={(e) => twoFactorAuthStore.handleCodeKeyDown(index, e)}
                            className={`two-factor-auth__code-input ${
                                !code ? "two-factor-auth__code-input--empty" : ""
                            }`}
                            maxLength={1}
                        />
                    ))}
                </div>
                {formik.touched.verificationCode && formik.errors.verificationCode ? (
                    <small className='p-error'>{formik.errors.verificationCode}</small>
                ) : null}
                <Button
                    label='Continue'
                    severity={
                        !formik.errors.verificationCode &&
                        formik.values.verificationCode.every((code) => code.trim())
                            ? "success"
                            : "secondary"
                    }
                    disabled={
                        !formik.values.verificationCode.every((code) => code.trim()) ||
                        !!formik.errors.verificationCode
                    }
                    type='submit'
                    className='two-factor-auth__button mt-4'
                />
                <div className='two-factor-auth__resend'>
                    <span>Didn't receive a code? </span>
                    {twoFactorAuthStore.resendTimer > 0 ? (
                        <span className='two-factor-auth__resend-timer'>
                            Resend code in {twoFactorAuthStore.resendTimer} seconds
                        </span>
                    ) : (
                        <button
                            type='button'
                            className='two-factor-auth__resend-link'
                            onClick={() => twoFactorAuthStore.handleResendCode()}
                        >
                            Resend code
                        </button>
                    )}
                </div>
            </form>
        </>
    );
});
