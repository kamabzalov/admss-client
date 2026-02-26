import { ReactElement, useState, useRef } from "react";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import { Button } from "primereact/button";
import { Splitter } from "dashboard/common/display";
import { SupportContactDialog } from "dashboard/profile/supportContact";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import "./index.css";
import { useToastMessage } from "common/hooks";

export const Security = observer((): ReactElement => {
    const rootStore = useStore();
    const { profileStore } = rootStore;
    const { showError, showSuccess } = useToastMessage();
    const [supportContactVisible, setSupportContactVisible] = useState<boolean>(false);
    const validationRequestRef = useRef<string>("");
    const isValidatingRef = useRef<boolean>(false);

    const {
        currentPassword,
        newPassword,
        confirmPassword,
        currentPasswordError,
        currentPasswordErrorMessage,
        isValidatingPassword,
        passwordsMismatch,
    } = profileStore;

    const handleCurrentPasswordChange = (password: string) => {
        profileStore.setCurrentPassword(password);
        validationRequestRef.current = "";
        profileStore.resetCurrentPasswordError();
    };

    const handleCurrentPasswordBlur = async () => {
        if (!currentPassword || currentPassword.length === 0) {
            profileStore.resetCurrentPasswordError();
            return;
        }

        if (isValidatingRef.current || validationRequestRef.current === currentPassword) {
            return;
        }

        isValidatingRef.current = true;
        validationRequestRef.current = currentPassword;
        profileStore.setIsValidatingPassword(true);
        profileStore.resetCurrentPasswordError();

        try {
            const response = await profileStore.validateCurrentPassword(currentPassword);

            if (response && "valid" in response) {
                if (!response.valid) {
                    profileStore.setCurrentPasswordError(true, response.message);
                } else {
                    profileStore.resetCurrentPasswordError();
                }
            } else if (response && "error" in response && response.error) {
                profileStore.setCurrentPasswordError(true, response.error as string);
            }
        } finally {
            profileStore.setIsValidatingPassword(false);
            isValidatingRef.current = false;
        }
    };

    const handleChangePassword = async () => {
        const response = await profileStore.changeUserPassword();

        if (response && "error" in response && response.error) {
            showError(response.error as string);
            return;
        }

        showSuccess("Password changed successfully");
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
                        setPassword={(value) => profileStore.setNewPassword(value)}
                    />
                </div>
                <div className='col-3 user-profile-password__confirm'>
                    <PasswordInput
                        label='Confirm Password'
                        password={confirmPassword}
                        setPassword={(value) => profileStore.setConfirmPassword(value)}
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
});
