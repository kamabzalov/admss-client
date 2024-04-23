import { CurrencyInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { InputNumber } from "primereact/inputnumber";

export const SettingsLease = () => {
    return (
        <div className='lease-settings flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Lease Settings</div>
            <div className='grid mt-2'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputNumber
                            value={0}
                            id='lease-settings__factor'
                            className='lease-settings__factor-input'
                        />
                        <label
                            htmlFor='lease-settings__factor'
                            className='float-label lease-settings__factor-label'
                        >
                            Money factor
                        </label>
                    </span>
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='lease-settings__dropdown' />
                        <label className='float-label'> Default mileage</label>
                    </span>
                </div>
                <div className='col-3'>
                    <CurrencyInput
                        className='lease-settings-currency__input'
                        title='Overage amount'
                        labelPosition='top'
                        value={0.15}
                    />
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown id='lease-settings__term' className='lease-settings__dropdown' />
                        <label className='float-label'>Term (months)</label>
                    </span>
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='lease-settings__dropdown' />
                        <label className='float-label'>Payment frequency</label>
                    </span>
                </div>
            </div>
        </div>
    );
};
