import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "../index.css";
import { auth } from "http/services/auth.service";
import { useState } from "react";
import { APP_TYPE, APP_VERSION } from "http/index";
import { Status } from "common/models/base-response";
import { useStore } from "store/hooks";
import { useToastMessage } from "common/hooks";
import { DASHBOARD_PAGE } from "common/constants/links";

export interface LoginForm {
    username: string;
    password: string;
    rememberme: boolean;
    application: "admin" | "crm" | "client" | string;
    version: string;
}

export const SignIn = () => {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { showError } = useToastMessage();
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

    const formik = useFormik<LoginForm>({
        initialValues: {
            username: userStore.rememberMe?.username || "",
            password: userStore.getDecryptedPassword() || "",
            rememberme: !!userStore.rememberMe?.username,
            application: APP_TYPE,
            version: APP_VERSION,
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
                const response = await auth(formik.values);
                if (response.status === Status.OK) {
                    if (!response.token) {
                        await Promise.reject(new Error("Invalid credentials"));
                        return;
                    }
                    try {
                        userStore.storedUser = response;
                        if (formik.values.rememberme) {
                            userStore.setRememberMeWithPassword(
                                formik.values.username,
                                formik.values.password
                            );
                        } else {
                            userStore.rememberMe = null;
                        }
                        if (userStore.twoFactorAuth.isEnabled) {
                            navigate("/2fa");
                        } else {
                            navigate(DASHBOARD_PAGE);
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
};
