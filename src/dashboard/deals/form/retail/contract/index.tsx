import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import { CurrencyInput, DateInput, PercentInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";

export const DealRetailContract = observer((): ReactElement => {
    return (
        <div className='grid deal-retail-contract row-gap-2'>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-contract__text-input w-full' />
                    <label className='float-label'>Account Number</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Amount of Finance' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Payment Frequency</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Term (months)</label>
                </span>
            </div>
            <div className='col-3'>
                <PercentInput labelPosition='top' value={0} title='Interest Rate' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Payment Amount' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Final Payment' />
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Total Interest' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Total of Payments' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-contract__text-input w-full' />
                    <label className='float-label'>Days to First Payment</label>
                </span>
            </div>
            <div className='col-3'>
                <DateInput name='First Payment Due' />
            </div>
            <div className='col-3'>
                <DateInput name='Final Payment Due' />
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <PercentInput labelPosition='top' value={0} title='Late Fee' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Flat/ Min Late Fee' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Late Fee Cap' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-contract__text-input w-full' />
                    <label className='float-label'>Grace Period</label>
                </span>
            </div>
        </div>
    );
});
