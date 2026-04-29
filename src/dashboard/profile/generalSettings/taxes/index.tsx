import { ComboBox } from "dashboard/common/form/dropdown";
import "./index.css";
import { PercentInput } from "dashboard/common/form/inputs";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";

export const SettingsTaxes = () => {
    return (
        <SettingsSection title='Taxes'>
            <div className='grid'>
                <div className='col-3'>
                    <ComboBox label='State' className='taxes__dropdown' />
                </div>
                <div className='col-3'>
                    <PercentInput />
                </div>
            </div>
        </SettingsSection>
    );
};
