import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import "../index.css";
import "./index.css";
import { DASHBOARD_PAGE } from "common/constants/links";
import { PHONE_NUMBER_REGEX } from "common/constants/regex";
import { useStore } from "store/hooks";
import { TwoFactorAuthStep } from "store/stores/user";
import { IntroductionStep } from "./components/Introduction";
import { PhoneNumberStep } from "./components/PhoneNumber";
import { VerificationCodeStep } from "./components/Verification";
import { BackupCodesStep } from "./components/BackupCodes";

export interface TwoFactorAuthForm {
    phoneNumber: string;
    verificationCode: string[];
    backupCodes: string[];
}

export const TwoFactorAuth = observer(() => {
    const navigate = useNavigate();
    const twoFactorAuthStore = useStore().userStore.twoFactorAuth;

    const formik = useFormik<TwoFactorAuthForm>({
        initialValues: {
            phoneNumber: "",
            verificationCode: ["", "", "", "", "", ""],
            backupCodes: [],
        },
        validateOnChange: true,
        validateOnBlur: true,
        validate: (data) => {
            let errors: any = {};

            if (twoFactorAuthStore.currentStep === TwoFactorAuthStep.PHONE_NUMBER) {
                if (!data.phoneNumber.trim()) {
                    errors.phoneNumber = "Phone number is required.";
                } else {
                    const cleanedPhone = data.phoneNumber.replace(/[\s()]/g, "");
                    if (!PHONE_NUMBER_REGEX.test(cleanedPhone)) {
                        errors.phoneNumber = "Invalid phone number. Please try again.";
                    }
                }
            }

            if (twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE) {
                if (data.verificationCode.some((code) => !code.trim())) {
                    errors.verificationCode = "All code digits are required.";
                }
            }

            return errors;
        },
        onSubmit: async () => {
            if (twoFactorAuthStore.currentStep === TwoFactorAuthStep.PHONE_NUMBER) {
                twoFactorAuthStore.handlePhoneNumberSubmit(formik.values.phoneNumber);
            } else if (twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE) {
                twoFactorAuthStore.handleVerificationCodeSubmit();
            }
        },
    });

    useEffect(() => {
        if (
            twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE &&
            twoFactorAuthStore.resendTimer > 0
        ) {
            const timer = setTimeout(() => {
                twoFactorAuthStore.decrementResendTimer();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [twoFactorAuthStore.currentStep, twoFactorAuthStore.resendTimer]);

    const handleOk = () => {
        navigate(DASHBOARD_PAGE);
    };

    const isCompactStep =
        twoFactorAuthStore.currentStep === TwoFactorAuthStep.PHONE_NUMBER ||
        twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE;

    const isSuccessStep = twoFactorAuthStore.currentStep === TwoFactorAuthStep.SUCCESS;

    return (
        <section className='sign'>
            <div
                className={`two-factor-auth ${isCompactStep ? "two-factor-auth--compact" : ""} ${
                    isSuccessStep ? "two-factor-auth--success" : ""
                }`}
            >
                <div className='two-factor-auth-wrapper'>
                    {twoFactorAuthStore.currentStep === TwoFactorAuthStep.INTRODUCTION && (
                        <IntroductionStep />
                    )}
                    {twoFactorAuthStore.currentStep === TwoFactorAuthStep.PHONE_NUMBER && (
                        <PhoneNumberStep formik={formik} />
                    )}
                    {twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE && (
                        <VerificationCodeStep formik={formik} />
                    )}
                    {twoFactorAuthStore.currentStep === TwoFactorAuthStep.SUCCESS && (
                        <BackupCodesStep onComplete={handleOk} />
                    )}
                </div>
            </div>
        </section>
    );
});
