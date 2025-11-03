import { Password, PasswordProps } from "primereact/password";
import { PASSWORD_REGEX, LATIN_PASSWORD_DISALLOWED_REGEX } from "common/constants/regex";
import "./index.css";
import { useId, useMemo } from "react";

interface PasswordInputProps extends PasswordProps {
    label?: string;
    password: string;
    setPassword: (password: string) => void;
    error?: boolean;
    errorMessage?: string;
}

const getRuleClass = (isCorrect: boolean) =>
    isCorrect ? "password-field__content--success" : "password-field__content--error";

export const PasswordInput = ({
    label = "Password (required)",
    password,
    setPassword,
    error = false,
    errorMessage = "Passwords do not match. Please check and try again.",
    ...props
}: PasswordInputProps) => {
    const id = useId();
    const hasValidLength = PASSWORD_REGEX.LENGTH_REGEX.test(password || "");
    const hasLowercase = PASSWORD_REGEX.LOWERCASE_REGEX.test(password || "");
    const hasUppercase = PASSWORD_REGEX.UPPERCASE_REGEX.test(password || "");
    const hasNumber = PASSWORD_REGEX.NUMBER_REGEX.test(password || "");
    const hasSpecial = PASSWORD_REGEX.SPECIAL_CHAR_REGEX.test(password || "");

    const isPasswordCorrect = useMemo(() => {
        return hasValidLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;
    }, [hasValidLength, hasLowercase, hasUppercase, hasNumber, hasSpecial]);

    const passwordContent = (
        <section className='password-field__content'>
            Password must be
            <span className={getRuleClass(hasValidLength)}>&nbsp;5–64 characters&nbsp;</span>
            and include <br /> at least
            <span className={getRuleClass(hasLowercase)}>&nbsp;1 lowercase</span> letter,
            <span className={getRuleClass(hasUppercase)}>&nbsp;1 uppercase</span> letter, <br />
            <span className={getRuleClass(hasNumber)}>&nbsp;1 Number&nbsp;</span>
            and
            <span className={getRuleClass(hasSpecial)}>&nbsp;1 special character&nbsp;</span>
            (!@#$%^&*()-+).
        </section>
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value || "";
        const sanitized = raw.replace(LATIN_PASSWORD_DISALLOWED_REGEX, "");
        setPassword(sanitized);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = (e.clipboardData?.getData("text") || "").replace(
            LATIN_PASSWORD_DISALLOWED_REGEX,
            ""
        );
        e.preventDefault();
        setPassword(text);
    };

    return (
        <span className='p-float-label password-field-container'>
            <Password
                inputId={id}
                name='Password'
                value={password}
                className='password-field'
                toggleMask
                autoComplete='new-password'
                inputClassName={`password-field-input ${!!error || (!!password && !isPasswordCorrect) ? "p-invalid" : ""}`}
                onChange={handleChange}
                onPaste={handlePaste}
                content={passwordContent}
                feedback={true}
                showIcon='adms-hide'
                hideIcon='adms-show'
                panelClassName='password-field-panel'
                {...props}
            />
            <label htmlFor={id} className='float-label'>
                {label}
            </label>
            {!!error && <div className='p-error pt-2'>{errorMessage}</div>}
        </span>
    );
};
