import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import twoFactorAuthImage from "assets/images/2fa_mobile_2.svg";
import { TWO_FACTOR_METHOD } from "common/models/user";
import { useLocation } from "react-router-dom";
import { LoginForm } from "sign/sign-in";
import { useToastMessage } from "common/hooks";
import { Status } from "common/models/base-response";

export const IntroductionStep = observer(() => {
    const twoFactorAuthStore = useStore().userStore.twoFactorAuth;
    const selectedMethod = twoFactorAuthStore.selectedMethod;
    const location = useLocation();
    const loginData = location.state as LoginForm | undefined;
    const { showError } = useToastMessage();

    const handleContinue = async () => {
        const response = (await twoFactorAuthStore.handleContinue(loginData?.username)) as any;
        if (response && response.status === Status.ERROR) {
            showError(response.error || "Failed to continue with 2FA setup");
        }
    };

    return (
        <>
            <div className='two-factor-auth__icon'>
                <img
                    src={twoFactorAuthImage}
                    alt='Two-factor authentication'
                    width={106}
                    height={101}
                />
            </div>
            <h1 className='two-factor-auth__title'>Two-factor authentication</h1>
            <p className='two-factor-auth__description'>
                To keep your account secure, please update your two-factor authentication (2FA) How
                would you like to receive your security code?
            </p>

            <div className='two-factor-auth__methods'>
                <div
                    className={`two-factor-auth__method ${
                        selectedMethod === TWO_FACTOR_METHOD.EMAIL
                            ? "two-factor-auth__method--selected"
                            : ""
                    }`}
                    onClick={() => (twoFactorAuthStore.selectedMethod = TWO_FACTOR_METHOD.EMAIL)}
                >
                    <div className='two-factor-auth__method-icon'>
                        <div className='two-factor-auth__method-icon-email' />
                    </div>
                    <div className='two-factor-auth__method-title'>By email</div>
                    <div className='two-factor-auth__method-description'>
                        Security codes will be sent to your email address
                    </div>
                </div>

                <div
                    className={`two-factor-auth__method ${
                        selectedMethod === TWO_FACTOR_METHOD.SMS
                            ? "two-factor-auth__method--selected"
                            : ""
                    }`}
                    onClick={() => (twoFactorAuthStore.selectedMethod = TWO_FACTOR_METHOD.SMS)}
                >
                    <div className='two-factor-auth__method-icon'>
                        <div className='two-factor-auth__method-icon-sms' />
                    </div>
                    <div className='two-factor-auth__method-title'>By SMS</div>
                    <div className='two-factor-auth__method-description'>
                        Security codes will be sent to your mobile phone
                    </div>
                </div>
            </div>

            <Button
                label='Get started'
                severity='success'
                disabled={!selectedMethod}
                onClick={handleContinue}
                className='two-factor-auth__button two-factor-auth__button--primary'
            />
        </>
    );
});
