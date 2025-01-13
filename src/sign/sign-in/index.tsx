import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "../index.css";
import { auth } from "http/services/auth.service";
import { setKey } from "services/local-storage.service";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";
import { APPLICATION } from "http/index";
import { LS_APP_USER } from "common/constants/localStorage";

export interface LoginForm {
    username: string;
    password: string;
    rememberme: boolean;
    application: string;
}

export default function SignIn() {
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);
    const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
    const formik = useFormik<LoginForm>({
        initialValues: {
            username: "",
            password: "",
            rememberme: false,
            application: APPLICATION,
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
        onSubmit: () => {
            auth(formik.values).then((response) => {
                if (response.status === "OK") {
                    setKey(LS_APP_USER, JSON.stringify(response));
                    navigate("/dashboard");
                } else {
                    toast.current?.show({
                        severity: "error",
                        summary: response.status || "Error",
                        detail: response?.error || String(response),
                        sticky: true,
                    });
                }
            });
        },
    });

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
                                    onChange={(e) => formik.setFieldValue("rememberme", e.checked)}
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
            <Toast ref={toast} />
        </section>
    );
}
