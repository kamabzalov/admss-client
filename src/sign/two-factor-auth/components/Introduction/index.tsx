import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import twoFactorAuthImage from "assets/images/2fa_mobile.svg";

export const IntroductionStep = observer(() => {
    const twoFactorAuthStore = useStore().userStore.twoFactorAuth;

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
                Add an extra layer of protection to your account with 2FA. Use a code sent to your
                phone along with your password to stay secure.
            </p>
            <Button
                label='Continue'
                severity='success'
                onClick={() => twoFactorAuthStore.handleContinue()}
                className='two-factor-auth__button two-factor-auth__button--primary'
            />
        </>
    );
});
