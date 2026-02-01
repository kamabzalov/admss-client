import { ReactElement, useState, useRef } from "react";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import { Button } from "primereact/button";
import { Splitter } from "dashboard/common/display";
import { SupportContactDialog } from "dashboard/profile/supportContact";
import { checkPassword } from "http/services/users";
import { useStore } from "store/hooks";
import "./index.css";

export const Security = (): ReactElement => {
    const { userStore } = useStore();
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [supportContactVisible, setSupportContactVisible] = useState<boolean>(false);
    const [currentPasswordError, setCurrentPasswordError] = useState<boolean>(false);
    const [currentPasswordErrorMessage, setCurrentPasswordErrorMessage] = useState<string | null>(
        null
    );
    const [isValidatingPassword, setIsValidatingPassword] = useState<boolean>(false);
    const validationRequestRef = useRef<string>("");
    const isValidatingRef = useRef<boolean>(false);

    const passwordsMismatch = newPassword !== confirmPassword && confirmPassword.length > 0;

    const resetCurrentPasswordError = () => {
        setCurrentPasswordError(false);
        setCurrentPasswordErrorMessage(null);
    };

    const handleCurrentPasswordChange = (password: string) => {
        setCurrentPassword(password);
        validationRequestRef.current = "";
        resetCurrentPasswordError();
    };

    const handleCurrentPasswordBlur = async () => {
        if (!currentPassword || currentPassword.length === 0) {
            resetCurrentPasswordError();
            return;
        }

        if (isValidatingRef.current || validationRequestRef.current === currentPassword) {
            return;
        }

        isValidatingRef.current = true;
        validationRequestRef.current = currentPassword;
        setIsValidatingPassword(true);
        resetCurrentPasswordError();

        if (!userStore.authUser?.useruid) {
            return;
        }

        try {
            const response = await checkPassword(userStore.authUser.useruid, currentPassword);

            if (response && "valid" in response) {
                if (!response.valid) {
                    setCurrentPasswordError(true);
                    setCurrentPasswordErrorMessage(response.message);
                } else {
                    resetCurrentPasswordError();
                }
            }
        } finally {
            setIsValidatingPassword(false);
            isValidatingRef.current = false;
        }
    };

    const handleChangePassword = () => {
        return;
    };

    const handleContactSupportClick = () => {
        setSupportContactVisible(true);
    };

    return (
        <div className='user-profile__content'>
            <div className='user-profile__header'>
                <h3 className='user-profile__section-title'>Security</h3>
            </div>
            <Splitter className='col-12 px-0' title='Change Password' />

            <div className='user-profile-password grid'>
                <div className='col-3'>
                    <PasswordInput
                        label='Current Password'
                        password={currentPassword}
                        setPassword={handleCurrentPasswordChange}
                        feedback={false}
                        skipValidation={true}
                        onBlur={handleCurrentPasswordBlur}
                        error={currentPasswordError}
                        errorMessage={currentPasswordErrorMessage || undefined}
                    />
                    <div className='user-profile-password__forgot'>
                        <span className='user-profile-password__forgot-link'>Forgot password?</span>
                    </div>
                </div>
                <div className='col-3'>
                    <PasswordInput
                        label='New Password'
                        password={newPassword}
                        setPassword={setNewPassword}
                    />
                </div>
                <div className='col-3 user-profile-password__confirm'>
                    <PasswordInput
                        label='Confirm Password'
                        password={confirmPassword}
                        setPassword={setConfirmPassword}
                        error={passwordsMismatch}
                    />
                </div>
                <div className='col-3'>
                    <Button
                        className='user-profile-password__button'
                        onClick={handleChangePassword}
                        disabled={
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword ||
                            passwordsMismatch ||
                            currentPasswordError ||
                            isValidatingPassword
                        }
                        severity='secondary'
                    >
                        Change Password
                    </Button>
                </div>
            </div>

            <Splitter className='col-12 mt-2 px-0' title='Two-Factor Authentication' />

            <div className='user-profile-two-factor'>
                <p className='user-profile-two-factor__text'>
                    For security reasons, two-factor authentication (2FA) cannot be disabled. If you
                    need to <strong>reset</strong> your 2FA settings, please
                    <span
                        className='user-profile-two-factor__link px-1'
                        onClick={handleContactSupportClick}
                    >
                        contact our support team
                    </span>
                    for assistance. We're here to help ensure your account remains secure.
                </p>
            </div>

            <SupportContactDialog
                visible={supportContactVisible}
                onHide={() => setSupportContactVisible(false)}
            />
        </div>
    );
};
