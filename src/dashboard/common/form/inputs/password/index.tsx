import { Password, PasswordProps } from "primereact/password";
import { PASSWORD_REGEX, LATIN_PASSWORD_DISALLOWED_REGEX } from "common/constants/regex";
import "./index.css";
import { useEffect, useId, useMemo } from "react";
import { TruncatedText } from "dashboard/common/display";
import { ERROR_MESSAGES } from "common/constants/error-messages";

interface PasswordInputProps extends PasswordProps {
    label?: string;
    password: string;
    setPassword: (password: string) => void;
    error?: boolean;
    errorMessage?: string;
    skipValidation?: boolean;
    onValidityChange?: (isValid: boolean) => void;
    withConfirm?: boolean;
    confirmLabel?: string;
    confirmPassword?: string;
    setConfirmPassword?: (password: string) => void;
    onConfirmValidityChange?: (isValid: boolean) => void;
}

const getRuleClass = (isCorrect: boolean) =>
    isCorrect ? "password-field__content--success" : "password-field__content--error";

interface PasswordRules {
    hasValidLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
    isCorrect: boolean;
}

const computePasswordRules = (password: string): PasswordRules => {
    const value = password || "";
    const hasValidLength = new RegExp(PASSWORD_REGEX.LENGTH_REGEX).test(value);
    const hasLowercase = new RegExp(PASSWORD_REGEX.LOWERCASE_REGEX).test(value);
    const hasUppercase = new RegExp(PASSWORD_REGEX.UPPERCASE_REGEX).test(value);
    const hasNumber = new RegExp(PASSWORD_REGEX.NUMBER_REGEX).test(value);
    const hasSpecial = new RegExp(PASSWORD_REGEX.SPECIAL_CHAR_REGEX).test(value);

    const isCorrect = hasValidLength && hasLowercase && hasUppercase && hasNumber && hasSpecial;
    return { hasValidLength, hasLowercase, hasUppercase, hasNumber, hasSpecial, isCorrect };
};

interface PasswordFieldProps {
    label: string;
    password: string;
    setPassword: (password: string) => void;
    error: boolean;
    errorMessage: string;
    skipValidation: boolean;
    onValidityChange?: (isValid: boolean) => void;
    passwordProps: PasswordProps;
}

const PasswordField = ({
    label,
    password,
    setPassword,
    error,
    errorMessage,
    skipValidation,
    onValidityChange,
    passwordProps,
}: PasswordFieldProps) => {
    const id = useId();
    const rules = useMemo(() => computePasswordRules(password), [password]);

    const isPasswordCorrect = useMemo(() => {
        if (skipValidation) return true;
        return rules.isCorrect;
    }, [rules.isCorrect, skipValidation]);

    useEffect(() => {
        onValidityChange?.(isPasswordCorrect);
    }, [onValidityChange, isPasswordCorrect]);

    const passwordContent = (
        <section className='password-field__content'>
            Password must be
            <span className={getRuleClass(rules.hasValidLength)}>&nbsp;5–64 characters&nbsp;</span>
            and include <br /> at least
            <span className={getRuleClass(rules.hasLowercase)}>&nbsp;1 lowercase</span> letter,
            <span className={getRuleClass(rules.hasUppercase)}>&nbsp;1 uppercase</span> letter,{" "}
            <br />
            <span className={getRuleClass(rules.hasNumber)}>&nbsp;1 Number&nbsp;</span>
            and
            <span className={getRuleClass(rules.hasSpecial)}>&nbsp;1 special character&nbsp;</span>
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
                inputClassName={`password-field-input ${error || (!!password && !isPasswordCorrect) ? "p-invalid" : ""}`}
                onChange={handleChange}
                onPaste={handlePaste}
                content={passwordContent}
                feedback={true}
                showIcon='adms-hide'
                hideIcon='adms-show'
                panelClassName='password-field-panel'
                {...passwordProps}
            />
            <label htmlFor={id} className='float-label'>
                {label}
            </label>
            {!!error && (
                <div className='p-error'>
                    <TruncatedText text={errorMessage} withTooltip={true} width='full' />
                </div>
            )}
        </span>
    );
};

export const PasswordInput = ({
    label = "Password (required)",
    password,
    setPassword,
    error = false,
    errorMessage = `${ERROR_MESSAGES.PASSWORD_MISMATCH} Please check and try again.`,
    skipValidation = false,
    onValidityChange,
    withConfirm = false,
    confirmLabel = "Confirm Password",
    confirmPassword,
    setConfirmPassword,
    onConfirmValidityChange,
    ...props
}: PasswordInputProps) => {
    const passwordProps = props;

    const canRenderConfirm = !!(withConfirm && setConfirmPassword);
    const confirmValue = canRenderConfirm ? confirmPassword || "" : "";
    const passwordsMismatch = canRenderConfirm
        ? password !== confirmValue && confirmValue.length > 0
        : false;

    if (!canRenderConfirm) {
        return (
            <PasswordField
                label={label}
                password={password}
                setPassword={setPassword}
                error={error}
                errorMessage={errorMessage}
                skipValidation={skipValidation}
                onValidityChange={onValidityChange}
                passwordProps={passwordProps}
            />
        );
    }

    return (
        <>
            <PasswordField
                label={label}
                password={password}
                setPassword={setPassword}
                error={false}
                errorMessage={errorMessage}
                skipValidation={skipValidation}
                onValidityChange={onValidityChange}
                passwordProps={passwordProps}
            />

            <PasswordField
                label={confirmLabel}
                password={confirmValue}
                setPassword={setConfirmPassword}
                error={passwordsMismatch || !!error}
                errorMessage={errorMessage}
                skipValidation={skipValidation}
                onValidityChange={onConfirmValidityChange}
                passwordProps={passwordProps}
            />
        </>
    );
};
