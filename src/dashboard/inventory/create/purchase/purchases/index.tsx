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

export const PurchasePurchases = (): ReactElement => (
    <div className='grid purchase-purchases row-gap-2'>
        <div className='col-6'>
            <SearchInput title='Purchased From (required)' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>E-mail</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>Phone number</label>
            </span>
        </div>

        <div className='col-6'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>Street address</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>City</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>Zip Code</label>
            </span>
        </div>

        <hr className='form-line' />

        <div className='col-6'>
            <SearchInput title='Auction Company' />
        </div>
        <div className='col-6'>
            <SearchInput title='Buyer Name' />
        </div>
        <div className='col-3'>
            <PercentInput labelPosition='top' title='Buyer Percent' />
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Buyer Commission' />
        </div>
        <div className='col-3'>
            <DateInput name='Date (required)' />
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Amount' />
        </div>

        <hr className='form-line' />

        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>Check Number</label>
            </span>
        </div>
        <div className='col-3'>
            <DateInput name='Check Date' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-purchases__text-input w-full' />
                <label className='float-label'>Lot #</label>
            </span>
        </div>
        <div className='col-3'>
            <BorderedCheckbox checked={false} name='Sold By Lot' />
        </div>
        <div className='col-12'>
            <InputTextarea className='purchase-purchases__text-area' placeholder='Notes' />
        </div>
    </div>
);
