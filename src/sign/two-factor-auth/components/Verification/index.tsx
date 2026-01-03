import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormikProps } from "formik";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { ProgressIndicator } from "../ProgressIndicator";
import { TWO_FACTOR_METHOD } from "common/models/user";
import { TwoFactorAuthStep } from "store/stores/user";
import { useToastMessage } from "common/hooks";
import { Status } from "common/models/base-response";

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
    const { showError } = useToastMessage();

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

    const handleResendCode = async () => {
        const response = (await twoFactorAuthStore.handleResendCode()) as any;
        if (response && response.status === Status.ERROR) {
            showError(response.error || "Failed to resend code");
        }
    };

    return (
        <>
            <ProgressIndicator currentStep={2} />
            <h1 className='two-factor-auth__title'>Authentication</h1>
            <p className='two-factor-auth__description two-factor-auth__description--verification'>
                Enter the code we just sent <br /> to &nbsp;
                {twoFactorAuthStore.selectedMethod === TWO_FACTOR_METHOD.EMAIL
                    ? twoFactorAuthStore.emailMasked || "your email"
                    : twoFactorAuthStore.phoneMasked ||
                      (twoFactorAuthStore.phoneNumber
                          ? formatPhoneNumber(twoFactorAuthStore.phoneNumber)
                          : "your phone")}
                &nbsp; to verify your identity.
            </p>
            <p className='two-factor-auth__description two-factor-auth__description--verification'>
                If you can't find it, check your inbox or spam folder.
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
                            onClick={handleResendCode}
                        >
                            Resend code
                        </button>
                    )}
                </div>
                <button
                    type='button'
                    className='two-factor-auth__try-another'
                    onClick={() =>
                        (twoFactorAuthStore.currentStep = TwoFactorAuthStep.INTRODUCTION)
                    }
                >
                    Try another method
                </button>
            </form>
        </>
    );
});
