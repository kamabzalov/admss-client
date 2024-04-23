import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { PercentInput } from "dashboard/common/form/inputs";

export const SettingsTaxes = () => {
    return (
        <>
            <div className='text-lg pb-4 font-semibold taxes'>Taxes</div>
            <div className='taxes__row grid'>
                <div className='col-3'>
                    <Dropdown placeholder='State' className='taxes__dropdown' />
                </div>
                <div className='col-3'>
                    <PercentInput />
                </div>
            </div>
        </>
    );
};
