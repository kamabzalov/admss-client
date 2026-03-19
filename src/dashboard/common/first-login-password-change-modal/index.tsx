import { ReactElement, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { PasswordInput } from "dashboard/common/form/inputs/password";
import "./index.css";
import { AuthUser } from "common/models/user";
import { changePasswordFirstLogin } from "http/services/auth.service";
import { useStore } from "store/hooks";
import { LS_APP_USER } from "common/constants/localStorage";
import { getKeyValue, setKey } from "services/local-storage.service";
import { useToastMessage } from "common/hooks";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { typeGuards } from "common/utils";
import { SUCCESS_MESSAGES } from "common/constants/success-messages";

interface FirstLoginPasswordModalProps {
    visible: boolean;
    user: AuthUser;
}

export const FirstLoginPasswordModal = ({
    visible,
    user,
}: FirstLoginPasswordModalProps): ReactElement => {
    const { showError, showSuccess } = useToastMessage();
    const store = useStore().userStore;

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const passwordsMismatch = useMemo(() => {
        return newPassword !== confirmPassword && confirmPassword.length > 0;
    }, [newPassword, confirmPassword]);

    const isButtonDisabled = useMemo(() => {
        return isSaving || !newPassword || !confirmPassword || passwordsMismatch;
    }, [isSaving, newPassword, confirmPassword, passwordsMismatch]);

    const handleSave = async () => {
        if (isSaving) return;

        if (!newPassword || !confirmPassword) {
            showError(ERROR_MESSAGES.PASSWORD_REQUIRED);
            return;
        }

        if (passwordsMismatch) {
            showError(ERROR_MESSAGES.PASSWORD_MISMATCH);
            return;
        }

        try {
            setIsSaving(true);
            const response = await changePasswordFirstLogin(newPassword);

            if (response && typeGuards.isExist(response.error)) {
                const err = (response as { error?: string }).error;
                showError(err);
                return;
            }

            const storedUser =
                (getKeyValue(LS_APP_USER) as
                    | (AuthUser & {
                          password_change_required?: boolean;
                      })
                    | null) ?? user;

            const updatedUser = {
                ...storedUser,
                password_change_required: false,
            } as AuthUser & { password_change_required?: boolean };

            setKey(LS_APP_USER, JSON.stringify(updatedUser));
            store.storedUser = updatedUser;

            setNewPassword("");
            setConfirmPassword("");
            showSuccess(SUCCESS_MESSAGES.PASSWORD_CHANGED);
        } catch (error) {
            showError(String(error) ?? ERROR_MESSAGES.UNEXPECTED_ERROR);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog
            visible={visible}
            onHide={() => {}}
            className='first-login-password-modal'
            closable={false}
            draggable={false}
            modal
            dismissableMask={false}
        >
            <div className='first-login-password-modal__content'>
                <div className='first-login-password-modal__header'>
                    <i className='icon adms-password first-login-password-modal__header-icon' />
                    <h3 className='first-login-password-modal__title'>Change password</h3>
                </div>
                <p className='first-login-password-modal__description'>
                    For security reasons, you must set a new password before continuing.
                </p>

                <div className='first-login-password-modal__fields'>
                    <PasswordInput
                        label='New Password'
                        password={newPassword}
                        setPassword={(v) => setNewPassword(v)}
                    />

                    <PasswordInput
                        label='Confirm Password'
                        password={confirmPassword}
                        setPassword={(v) => setConfirmPassword(v)}
                        error={passwordsMismatch}
                    />
                </div>

                <div className='first-login-password-modal__actions'>
                    <Button
                        label='Save Password'
                        onClick={() => {
                            void handleSave();
                        }}
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                    />
                </div>
            </div>
        </Dialog>
    );
};
