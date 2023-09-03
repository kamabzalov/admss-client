import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import "../index.css";
import { auth } from "../../http/services/auth.service";
import { setKey } from "../../services/local-storage.service";

export interface LoginForm {
    username: string;
    password: string;
    rememberme: boolean;
}

export default function SignIn() {
    const navigate = useNavigate();
    const formik = useFormik<LoginForm>({
        initialValues: {
            username: "",
            password: "",
            rememberme: false,
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
                if (response) {
                    setKey("admss-client-app-user", JSON.stringify(response));
                    navigate("/dashboard");
                } else {
                    alert("Error");
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
                        <div className='sign-in__input-space'>
                            <div className='p-input-icon-right w-full'>
                                <i className='admss-icon-user sign__icon' />
                                <InputText
                                    placeholder='Username'
                                    className='sign__input'
                                    id='username'
                                    onChange={formik.handleChange}
                                    value={formik.values.username}
                                />
                                {formik.errors.username ? (
                                    <span>{formik.errors.username}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className='sign-in__input-space'>
                            <div className='p-input-icon-right w-full'>
                                <i className='admss-icon-password sign__icon' />
                                <InputText
                                    placeholder='Password'
                                    className='sign__input'
                                    id='password'
                                    type='password'
                                    onChange={formik.handleChange}
                                    value={formik.values.password}
                                />
                                {formik.errors.password ? (
                                    <span>{formik.errors.password}</span>
                                ) : null}
                            </div>
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
                                <label htmlFor='remember' className='ml-2 user-help__label'>
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
}
