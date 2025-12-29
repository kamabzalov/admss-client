import { useLocation, useNavigate } from "react-router-dom";
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
import { LoginForm } from "sign/sign-in";
import { auth } from "http/services/auth.service";
import { Status } from "common/models/base-response";
import { useToastMessage } from "common/hooks";
import { createApiDashboardInstance } from "http/index";
import { LS_LAST_ROUTE, LastRouteData } from "common/constants/localStorage";
import { ROUTE_RESTORE_TIMEOUT_HOURS } from "common/settings";
import { convertTimeToMilliseconds } from "common/helpers";

export interface TwoFactorAuthForm {
    phoneNumber: string;
    verificationCode: string[];
    backupCodes: string[];
}

export const TwoFactorAuth = observer(() => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showError } = useToastMessage();
    const loginData = location.state as LoginForm | undefined;
    const userStore = useStore().userStore;
    const twoFactorAuthStore = userStore.twoFactorAuth;

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
                await twoFactorAuthStore.handlePhoneNumberSubmit(formik.values.phoneNumber);
            } else if (twoFactorAuthStore.currentStep === TwoFactorAuthStep.VERIFICATION_CODE) {
                const success = await twoFactorAuthStore.handleVerificationCodeSubmit();
                if (success) {
                    if (loginData) {
                        try {
                            const response = await auth({
                                ...loginData,
                                verification_token: twoFactorAuthStore.verificationToken,
                            });
                            if (response && response.status === Status.OK && "token" in response) {
                                userStore.storedUser = response;
                                createApiDashboardInstance(navigate);

                                const storedRouteDataString = localStorage.getItem(LS_LAST_ROUTE);
                                if (storedRouteDataString) {
                                    try {
                                        const storedRouteData: LastRouteData =
                                            JSON.parse(storedRouteDataString);
                                        if (
                                            storedRouteData.path &&
                                            storedRouteData.timestamp &&
                                            storedRouteData.useruid &&
                                            storedRouteData.useruid === response.useruid
                                        ) {
                                            const currentTime = Date.now();
                                            const storedTime = storedRouteData.timestamp;
                                            const routeAgeInMilliseconds = currentTime - storedTime;
                                            const routeRestoreTimeoutInMilliseconds =
                                                convertTimeToMilliseconds(
                                                    ROUTE_RESTORE_TIMEOUT_HOURS
                                                );
                                            if (
                                                storedTime > 0 &&
                                                routeAgeInMilliseconds > 0 &&
                                                routeAgeInMilliseconds <=
                                                    routeRestoreTimeoutInMilliseconds
                                            ) {
                                                localStorage.removeItem(LS_LAST_ROUTE);
                                                navigate(storedRouteData.path, { replace: true });
                                                return;
                                            }
                                        }
                                    } catch {}
                                }
                                localStorage.removeItem(LS_LAST_ROUTE);
                                navigate(DASHBOARD_PAGE, { replace: true });
                            } else {
                                showError(response?.error || "Login failed after 2FA");
                            }
                        } catch (error) {
                            showError("An error occurred during login after 2FA");
                        }
                    }
                } else {
                    showError("Invalid verification code");
                }
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
