import { TextInput } from "dashboard/common/form/inputs";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "../index.css";
import { auth, check2FA } from "http/services/auth.service";
import { useEffect } from "react";
import { APP_TYPE, APP_VERSION, createApiDashboardInstance } from "http/index";
import { Status } from "common/models/base-response";
import { useStore } from "store/hooks";
import { TwoFactorAuthStep } from "store/stores/user";
import { useToastMessage } from "common/hooks";
import { DASHBOARD_PAGE } from "common/constants/links";
import { LS_LAST_ROUTE, LastRouteData, LS_APP_USER } from "common/constants/localStorage";
import { ROUTE_RESTORE_TIMEOUT_HOURS } from "common/settings";
import { convertTimeToMilliseconds } from "common/helpers";
import { getKeyValue } from "services/local-storage.service";
import {
    getTfaSessionUid,
    isAuthResponseTfaRequired,
    TwoFactorCheckResponse,
} from "common/models/user";
import { observer } from "mobx-react-lite";
import { ERROR_MESSAGES } from "common/constants/error-messages";

export interface LoginForm {
    username: string;
    password: string;
    rememberme: boolean;
    application: "admin" | "crm" | "client" | string;
    version: string;
    deviceuid?: string;
    devicename?: string;
    verification_token?: string;
}

const parseLastRoute = (routeDataString: string): LastRouteData | null => {
    try {
        return JSON.parse(routeDataString);
    } catch {
        return null;
    }
};

const isRouteValid = (routeData: LastRouteData, expectedUseruid: string): boolean => {
    return Boolean(
        routeData.path &&
            routeData.timestamp &&
            routeData.useruid &&
            routeData.useruid === expectedUseruid
    );
};

const isRouteExpired = (timestamp: number): boolean => {
    const currentTime = Date.now();
    const routeAgeInMilliseconds = currentTime - timestamp;
    const routeRestoreTimeoutInMilliseconds = convertTimeToMilliseconds(
        ROUTE_RESTORE_TIMEOUT_HOURS
    );

    return (
        routeAgeInMilliseconds <= 0 || routeAgeInMilliseconds > routeRestoreTimeoutInMilliseconds
    );
};

const getRestoredPath = (routeData: LastRouteData | null, useruid: string): string | null => {
    if (!routeData || !isRouteValid(routeData, useruid)) {
        return null;
    }

    if (isRouteExpired(routeData.timestamp)) {
        return null;
    }

    return routeData.path;
};

export const SignIn = observer(() => {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { showError } = useToastMessage();

    useEffect(() => {
        const storedUser = getKeyValue(LS_APP_USER);
        if (!storedUser?.token) {
            return;
        }

        let targetPath = DASHBOARD_PAGE;
        const storedRouteDataString = localStorage.getItem(LS_LAST_ROUTE);

        if (storedRouteDataString) {
            const storedRouteData = parseLastRoute(storedRouteDataString);
            const restoredPath = getRestoredPath(storedRouteData, storedUser.useruid);

            if (restoredPath) {
                targetPath = restoredPath;
                localStorage.removeItem(LS_LAST_ROUTE);
            }
        }

        if (targetPath === DASHBOARD_PAGE) {
            localStorage.removeItem(LS_LAST_ROUTE);
        }

        navigate(targetPath, { replace: true });
    }, [navigate, userStore.authUser]);

    const formik = useFormik<LoginForm>({
        initialValues: {
            username: userStore.rememberMe?.username || "",
            password: userStore.getDecryptedPassword() || "",
            rememberme: !!userStore.rememberMe?.username,
            application: APP_TYPE,
            version: APP_VERSION,
            deviceuid: userStore.deviceUID,
            devicename: navigator.userAgent.substring(0, 100),
        },
        validate: (data: { username: string; password: string }) => {
            let errors: any = {};

            if (!data.username.trim()) {
                errors.username = ERROR_MESSAGES.USERNAME_REQUIRED;
            }

            if (!data.password.trim()) {
                errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
            }

            return errors;
        },
        onSubmit: async () => {
            try {
                const response = await auth(formik.values);
                if (!response) {
                    formik.setTouched({ username: true, password: true }, false);
                    formik.setErrors({
                        username: ERROR_MESSAGES.INCORRECT_USERNAME,
                        password: ERROR_MESSAGES.INCORRECT_PASSWORD,
                    });
                    showError(ERROR_MESSAGES.AUTHENTICATION_FAILED);
                    return;
                }
                if (response.status === Status.OK && "token" in response && response.token) {
                    try {
                        userStore.storedUser = response;
                        createApiDashboardInstance(navigate);
                        if (formik.values.rememberme) {
                            userStore.setRememberMeWithPassword(
                                formik.values.username,
                                formik.values.password
                            );
                        } else {
                            userStore.rememberMe = null;
                        }
                    } catch (error) {
                        showError(String(error));
                        return;
                    }
                    return;
                }
                if (isAuthResponseTfaRequired(response)) {
                    const checkResponse = (await check2FA({
                        user: formik.values.username,
                        deviceuid: userStore.deviceUID,
                    })) as TwoFactorCheckResponse;
                    userStore.twoFactorAuth.reset();
                    const sessionUid = getTfaSessionUid(response);
                    if (sessionUid) {
                        userStore.twoFactorAuth.twoFactorSessionUID = sessionUid;
                    }
                    userStore.twoFactorAuth.currentStep = TwoFactorAuthStep.INTRODUCTION;
                    if (checkResponse?.tfa_method) {
                        userStore.twoFactorAuth.selectedMethod = checkResponse.tfa_method;
                    }
                    navigate("/2fa", { state: formik.values });
                    return;
                }
                const serverError =
                    typeof response === "object" && response !== null && "error" in response
                        ? (response as { error?: string }).error
                        : String(response);
                formik.setTouched({ username: true, password: true }, false);
                formik.setErrors({
                    username: ERROR_MESSAGES.INCORRECT_USERNAME,
                    password: ERROR_MESSAGES.INCORRECT_PASSWORD,
                });
                showError(serverError || ERROR_MESSAGES.AUTHENTICATION_FAILED);
            } catch (error) {
                formik.setTouched({ username: true, password: true }, false);
                formik.setErrors({
                    username: ERROR_MESSAGES.INCORRECT_USERNAME,
                    password: ERROR_MESSAGES.INCORRECT_PASSWORD,
                });
                const errorMessage = ERROR_MESSAGES.UNEXPECTED_ERROR;
                showError(error instanceof Error ? error.message : errorMessage);
            }
        },
    });

    const handleRememberMeChange = (checked: boolean) => {
        formik.setFieldValue("rememberme", checked);
        if (checked && formik.values.username && formik.values.password) {
            userStore.setRememberMeWithPassword(formik.values.username, formik.values.password);
        } else if (!checked) {
            userStore.rememberMe = null;
        }
    };

    return (
        <section className='sign'>
            <div className='sign-in'>
                <div className='sign-in-wrapper'>
                    <h1 className='sign__title'>Sign In</h1>
                    <form onSubmit={formik.handleSubmit}>
                        <div className='sign-in__input space pt-2 pb-1'>
                            <span className='w-full p-float-label p-input-icon-right'>
                                <i className='adms-username-my-profile sign__icon' />
                                <TextInput
                                    name='username'
                                    label='Username'
                                    placeholder='Username'
                                    className='sign__input'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.username}
                                    error={Boolean(
                                        formik.touched.username && formik.errors.username
                                    )}
                                    errorMessage={formik.errors.username}
                                />
                            </span>
                        </div>

                        <div className='sign-in__input space pt-2'>
                            <PasswordInput
                                label='Password'
                                password={formik.values.password}
                                setPassword={(value) => formik.setFieldValue("password", value)}
                                onBlur={formik.handleBlur("password")}
                                feedback={false}
                                skipValidation={true}
                                error={Boolean(formik.touched.password && formik.errors.password)}
                                errorMessage={formik.errors.password}
                            />
                        </div>

                        <div className='flex justify-content-between user-help'>
                            <div className='flex align-items-center'>
                                <Checkbox
                                    inputId='rememberme'
                                    name='rememberme'
                                    value={formik.values.rememberme}
                                    checked={formik.values.rememberme}
                                    onChange={(e) => handleRememberMeChange(e.checked || false)}
                                />
                                <label htmlFor='rememberme' className='ml-2 user-help__label'>
                                    Remember me
                                </label>
                            </div>
                            <Link className='user-help__link font-semibold' to='/'>
                                Forgot password?
                            </Link>
                        </div>
                        <div className='text-center'>
                            <Button
                                label='Sign in'
                                severity={
                                    !!(formik.errors.username || formik.errors.password)
                                        ? "secondary"
                                        : "success"
                                }
                                type='submit'
                                className='sign__button font-bold'
                                disabled={!!(formik.errors.username || formik.errors.password)}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
});
