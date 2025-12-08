import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { ProgressIndicator } from "sign/two-factor-auth/components/ProgressIndicator";
import { useToastMessage } from "common/hooks";

interface BackupCodesStepProps {
    onComplete: () => void;
}

export const BackupCodesStep = observer(({ onComplete }: BackupCodesStepProps) => {
    const twoFactorAuthStore = useStore().userStore.twoFactorAuth;
    const { showSuccess } = useToastMessage();

    const formatBackupCode = (code: string): string => {
        const digits = code.replace(/\D/g, "");
        if (digits.length === 6) {
            return `${digits.slice(0, 3)} ${digits.slice(3)}`;
        }
        return code;
    };

    const handleCopyBackupCodes = () => {
        twoFactorAuthStore.handleCopyBackupCodes();
        showSuccess("Backup codes copied to clipboard");
    };

    return (
        <div className='two-factor-auth__success'>
            <ProgressIndicator currentStep={3} />
            <div className='two-factor-auth__success-icon'>
                <i className='icon adms-check' />
            </div>
            <h1 className='two-factor-auth__title two-factor-auth__title--success'>
                Successfully Enabled
            </h1>
            <p className='two-factor-auth__description'>
                Save this emergency backup code and store <br /> it somewhere safe. It allows you to
                log in if you can't receive verification codes on your phone.
            </p>
            <div className='two-factor-auth__backup-codes'>
                {twoFactorAuthStore.backupCodes.map((code, index) => (
                    <div key={index} className='two-factor-auth__backup-code'>
                        {formatBackupCode(code)}
                    </div>
                ))}
            </div>
            <div className='two-factor-auth__backup-actions'>
                <button
                    type='button'
                    className='two-factor-auth__backup-action'
                    onClick={() => twoFactorAuthStore.handleSaveBackupCodes()}
                >
                    Save
                </button>
                <button
                    type='button'
                    className='two-factor-auth__backup-action'
                    onClick={() => twoFactorAuthStore.handlePrintBackupCodes()}
                >
                    Print
                </button>
                <button
                    type='button'
                    className='two-factor-auth__backup-action'
                    onClick={handleCopyBackupCodes}
                >
                    Copy
                </button>
            </div>
            <div className='text-center'>
                <Button
                    label='OK'
                    severity='success'
                    onClick={onComplete}
                    className='two-factor-auth__button two-factor-auth__button--primary'
                />
            </div>
        </div>
    );
});
