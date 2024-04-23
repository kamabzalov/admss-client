import { PercentInput } from "dashboard/common/form/inputs";

import "./index.css";
import { Dropdown } from "primereact/dropdown";

interface SettingsAccountProps {
    settings?: any;
}

export const SettingsContract = ({ settings }: SettingsAccountProps) => {
    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Contract Settings</div>
            <div className='grid settings-contract'>
                <div className='col-3'>
                    <PercentInput
                        className='settings-contract__input'
                        title='Late fee percentage'
                        labelPosition='top'
                    />
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='settings-contract__dropdown' />
                        <label className='float-label'>Payment frequency</label>
                    </span>
                </div>
            </div>
        </div>
    );
};
