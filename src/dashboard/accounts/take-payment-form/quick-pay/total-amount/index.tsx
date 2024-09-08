import { ACCOUNT_PAYMENT_METHODS } from "common/constants/account-options";
import { DateInput, CurrencyInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";

export const AccountTotalAmount = observer((): ReactElement => {
    return (
        <div className='take-payment__card'>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payment Date</label>
                <DateInput className='take-payment__input' />
            </div>

            <div className='take-payment__item'>
                <label className='take-payment__label'>Pmt Method</label>
                <Dropdown
                    id='pmtMethod'
                    options={ACCOUNT_PAYMENT_METHODS}
                    optionValue='id'
                    optionLabel='name'
                />
            </div>

            <div className='take-payment__item'>
                <label className='take-payment__label'>Check#</label>
                <InputText id='checkNumber' />
            </div>

            <hr className='form-line' />

            <div className='quick-pay__total'>
                <h3 className='quick-pay__title color-green'>Total Amount Paid:</h3>
                <div className='quick-pay__input'>
                    <CurrencyInput className='quick-pay__total-input' value={0} />
                    <Button severity='secondary' icon='pi pi-arrow-right' />
                </div>
            </div>

            <hr className='form-line' />

            <h3 className='take-payment__title'>Breakdown of Total Paid</h3>

            <div className='take-payment__item color-dusty-blue'>
                <label className='take-payment__label'>Down/ Pickup:</label>
                <CurrencyInput value={0} />
            </div>
            <div className='take-payment__item color-red'>
                <label className='take-payment__label'>Fees:</label>
                <CurrencyInput value={0} />
            </div>
            <div className='take-payment__item color-green'>
                <label className='take-payment__label'>Direct to Principal:</label>
                <CurrencyInput value={0} />
            </div>
            <div className='take-payment__item color-green'>
                <label className='take-payment__label'>Contract Payment:</label>
                <CurrencyInput value={0} />
            </div>
        </div>
    );
});
