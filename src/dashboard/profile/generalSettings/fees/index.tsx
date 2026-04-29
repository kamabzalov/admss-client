import { CurrencyInput } from "dashboard/common/form/inputs";
import "./index.css";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";

export const SettingsFees = () => {
    return (
        <SettingsSection title='Fees'>
            <div className='grid settings-fees'>
                <div className='col-6'>
                    <CurrencyInput title='Default documentation fee' value={421} />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default transfer tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default vehicle pack' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default spare tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default title fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default spare transfer tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default tag fee' />
                </div>
            </div>
        </SettingsSection>
    );
};
