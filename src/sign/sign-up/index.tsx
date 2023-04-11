import { SubmitHandler, useForm } from 'react-hook-form';
import 'sign/sign.css';

interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignUp() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>({
        mode: 'all',
        reValidateMode: 'onSubmit',
    });

    const registerUser: SubmitHandler<RegisterForm> = data => {};

    return <div className="auth"></div>;
}
