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
            <div className='flex justify-content-between align-items-center'>
                <div className='contract-percentage'>
                    <PercentInput
                        className='contract-percentage__input'
                        title='Late fee percentage'
                    />
                </div>

                <Dropdown placeholder='Payment frequency' className='contract--dropdown' />
            </div>
        </div>
    );
};
