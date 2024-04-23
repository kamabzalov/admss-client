import { PercentInput } from "dashboard/common/form/inputs";

import "./index.css";
import { Dropdown } from "primereact/dropdown";

interface SettingsAccountProps {
    settings?: any;
}

export const SettingsContract = ({ settings }: SettingsAccountProps) => {
    return (
        <div className='contract flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Contract Settings</div>
            <div className='grid'>
                <div className='col-3'>
                    <PercentInput
                        className='contract-percentage__input'
                        title='Late fee percentage'
                        labelPosition='top'
                    />
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='contract__dropdown' />
                        <label className='float-label'>Payment frequency</label>
                    </span>
                </div>
            </div>
        </div>
    );
};
