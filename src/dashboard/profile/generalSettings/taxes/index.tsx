import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { PercentInput } from "dashboard/common/form/inputs";

export const SettingsTaxes = () => {
    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Taxes</div>
            <div className='grid'>
                <div className='col-3'>
                    <Dropdown placeholder='State' className='taxes__dropdown' />
                </div>
                <div className='col-3'>
                    <PercentInput />
                </div>
            </div>
        </div>
    );
};
