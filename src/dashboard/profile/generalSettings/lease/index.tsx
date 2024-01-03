import { CurrencyInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { InputNumber } from "primereact/inputnumber";

export const SettingsLease = () => {
    return (
        <div className='lease-settings flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Lease Settings</div>
            <div className='lease-settings__row'>
                <div className='flex align-items-center justify-content-between'>
                    <label
                        htmlFor='lease-settings__factor'
                        className='lease-settings__factor-label'
                    >
                        Money factor
                    </label>
                    <InputNumber
                        value={0}
                        id='lease-settings__factor'
                        className='lease-settings__factor-input'
                    />
                </div>
                <div className='flex align-items-center justify-content-between'>
                    <label
                        htmlFor='lease-settings__mileage'
                        className='lease-settings__mileage-label wrap'
                    >
                        Default mileage
                    </label>
                    <Dropdown
                        placeholder='1500'
                        id='lease-settings__mileage'
                        className='lease-settings__mileage-dropdown'
                    />
                </div>
            </div>
            <div className='lease-settings__row'>
                <div className='lease-settings-currency'>
                    <CurrencyInput
                        className='lease-settings-currency__input'
                        title='Overage amount'
                        value={0.15}
                    />
                </div>

                <div className='flex align-items-center justify-content-between'>
                    <label htmlFor='lease-settings__term' className='lease-settings__term-label'>
                        Term (months)
                    </label>
                    <Dropdown
                        placeholder='6'
                        id='lease-settings__term'
                        className='lease-settings__term-dropdown'
                    />
                </div>
            </div>
            <div className='lease-settings__row'>
                <Dropdown
                    placeholder='Payment frequency'
                    className='lease-settings__payment-dropdown'
                />
            </div>
        </div>
    );
};
