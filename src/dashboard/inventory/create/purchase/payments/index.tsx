import {
    BorderedCheckbox,
    CurrencyInput,
    DateInput,
    PercentInput,
    SearchInput,
} from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";

export const PurchasePayments = (): ReactElement => (
    <div className='grid purchase-purchases row-gap-2'>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Pack for this Vehicle' />
        </div>
        <div className='col-3'>
            <BorderedCheckbox checked={false} name='Default Expenses' />
        </div>
        <div className='col-3'>
            <BorderedCheckbox checked={false} name='Paid' />
        </div>
        <div className='col-3'>
            <BorderedCheckbox checked={false} name='Sales Tax Paid' />
        </div>

        <div className='col-12'>
            <InputTextarea className='purchase-payments__text-area' placeholder='Description' />
        </div>
    </div>
);
