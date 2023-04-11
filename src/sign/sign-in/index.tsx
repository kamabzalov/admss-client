import { SubmitHandler, useForm } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Link } from 'react-router-dom';

interface LoginForm {
    username: string;
    password: string;
    rememberMe: boolean;
}

export default function SignIn() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        mode: 'all',
        reValidateMode: 'onSubmit',
    });

    const login: SubmitHandler<LoginForm> = data => {};

    return (
        <section className="sign">
            <div className="sign-in">
                <h1 className="sign__title">Sign In</h1>
                <form noValidate onSubmit={handleSubmit(login)}>
                    <div className="m-b-15">
                        <p className="m-b-5">
                            <label htmlFor="username">Username:</label>
                        </p>
                        <div className="p-input-icon-right w-full">
                            <i className="pi pi-spin pi-spinner" />
                            <InputText className="sign__input" id="username" />
                        </div>
                    </div>

                    <div className="m-b-10">
                        <p className="m-b-5">
                            <label htmlFor="password">Password:</label>
                        </p>
                        <div className="p-input-icon-right w-full">
                            <i className="pi pi-spin pi-spinner" />
                            <InputText className="sign__input" id="password" type="password" />
                        </div>
                    </div>

                    <div className="flex justify-content-between m-b-40 user-help">
                        <div>
                            <Checkbox inputId="remember" name="remember" checked />
                            <label htmlFor="remember" className="ml-2">
                                Remember me
                            </label>
                        </div>
                        <Link className="user-help__link" to="/">
                            Forgot password?
                        </Link>
                    </div>
                    <Button label="Sign in" className="w-full m-b-15 sign__button" />
                    <p className="sign-controls">
                        Don’t have an account yet?{' '}
                        <Link className="sign-controls__link" to="/sign-up">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </section>
    );
}
