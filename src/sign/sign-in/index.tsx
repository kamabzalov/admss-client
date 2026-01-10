import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "../index.css";
import { auth, check2FA } from "http/services/auth.service";
import { useState, useEffect } from "react";
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
import { TwoFactorCheckResponse } from "common/models/user";
import { observer } from "mobx-react-lite";

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
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

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
                errors.username = "Username is required.";
            }

            if (!data.password.trim()) {
                errors.password = "Password is required.";
            }

            return errors;
        },
        onSubmit: async () => {
            try {
                const checkResponse = (await check2FA({
                    user: formik.values.username,
                    deviceuid: userStore.deviceUID,
                })) as TwoFactorCheckResponse;

                if (
                    checkResponse &&
                    ("required" in checkResponse || "tfa_required" in checkResponse) &&
                    (checkResponse.required || checkResponse.tfa_required)
                ) {
                    userStore.twoFactorAuth.reset();
                    userStore.twoFactorAuth.currentStep = TwoFactorAuthStep.INTRODUCTION;
                    if (checkResponse.tfa_method) {
                        userStore.twoFactorAuth.selectedMethod = checkResponse.tfa_method;
                    }
                    navigate("/2fa", { state: formik.values });
                    return;
                }

                const response = await auth(formik.values);
                if (!response) {
                    showError("Authentication failed");
                    return;
                }
                if (response.status === Status.OK && "token" in response) {
                    if (!response.token) {
                        await Promise.reject(new Error("Invalid credentials"));
                        return;
                    }
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
                } else {
                    showError(response?.error || String(response));
                }
            } catch (error) {
                const errorMessage = "An unexpected error occurred during login";
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
                        <div className='sign-in__input space pt-2 pb-2'>
                            <span className='w-full p-float-label p-input-icon-right'>
                                <i className='adms-username-my-profile sign__icon' />
                                <InputText
                                    placeholder='Username'
                                    className={`sign__input ${
                                        formik.touched.username && formik.errors.username
                                            ? "p-invalid"
                                            : ""
                                    }`}
                                    id='username'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.username}
                                />
                                <label htmlFor='username'>Username</label>
                            </span>
                            {formik.touched.username && formik.errors.username ? (
                                <small className='p-error error-space'>
                                    {formik.errors.username}
                                </small>
                            ) : null}
                        </div>

                        <div className='sign-in__input space pt-2 pb-2'>
                            <span className='w-full p-float-label sign-in__password'>
                                <i
                                    className={`icon ${
                                        formik.values.password
                                            ? passwordVisible
                                                ? "icon adms-hide"
                                                : "icon adms-show"
                                            : "icon adms-password"
                                    } sign__icon`}
                                    onClick={() => setPasswordVisible((prev) => !prev)}
                                />

                                <InputText
                                    placeholder='Password'
                                    className={`sign__input ${formik.touched.password && formik.errors.password ? "p-invalid" : ""}`}
                                    id='password'
                                    type={!passwordVisible ? "password" : "text"}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.password}
                                />

                                <label htmlFor='password'>Password</label>
                            </span>
                            {formik.touched.password && formik.errors.password ? (
                                <small className='p-error'>{formik.errors.password}</small>
                            ) : null}
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
                                severity='success'
                                type='submit'
                                className='sign__button font-bold'
                            />
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
});
