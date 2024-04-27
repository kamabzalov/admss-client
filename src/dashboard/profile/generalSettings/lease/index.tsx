import { CurrencyInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { InputNumber } from "primereact/inputnumber";

export const SettingsLease = () => {
    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Lease Settings</div>
            <div className='grid settings-lease'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputNumber
                            value={0}
                            id='settings-lease__factor'
                            className='settings-lease__input'
                        />
                        <label
                            htmlFor='settings-lease__factor'
                            className='float-label settings-lease__label'
                        >
                            Money factor
                        </label>
                    </span>
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='settings-lease__dropdown' />
                        <label className='float-label'> Default mileage</label>
                    </span>
                </div>
                <div className='col-3'>
                    <CurrencyInput
                        className='settings-lease-currency__input'
                        title='Overage amount'
                        labelPosition='top'
                        value={0.15}
                    />
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown id='settings-lease__term' className='settings-lease__dropdown' />
                        <label className='float-label'>Term (months)</label>
                    </span>
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown className='settings-lease__dropdown' />
                        <label className='float-label'>Payment frequency</label>
                    </span>
                </div>
            </div>
        </div>
    );
};
