import { CurrencyInput, DateInput, SearchInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
// import "./index.css";

export const PurchaseTitle = (): ReactElement => (
    <div className='grid purchase-title row-gap-2'>
        <div className='col-3'>
            <div className='purchase-title__checkbox flex'>
                <Checkbox
                    inputId='title-vehicle'
                    name='title-vehicle'
                    className='mt-1'
                    onChange={() => {}}
                    checked={false}
                />
                <label htmlFor='title-vehicle' className='ml-2'>
                    Vehicle was a Trade-In
                </label>
            </div>
        </div>
        <div className='col-3'>
            <Dropdown name='Floor' title='Consignor' />
        </div>
        <div className='col-3'>
            <Dropdown name='Consign Date' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Net To Owner</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'># Days</label>
            </span>
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='titlement Fee' />
        </div>

        <div className='form-line'></div>

        <div className='col-3'>
            <div className='purchase-title__checkbox flex'>
                <Checkbox
                    inputId='title-vehicle'
                    name='title-vehicle'
                    className='mt-1'
                    onChange={() => {}}
                    checked={false}
                />
                <label htmlFor='title-vehicle' className='ml-2'>
                    Returned to Seller Unsold
                </label>
            </div>
        </div>
        <div className='col-3'>
            <DateInput name='Return Date' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Reserve Factor</label>
            </span>
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Reserve Amount' />
        </div>
        <div className='col-12'>
            <InputTextarea className='purchase-title__text-area' placeholder='titlement Notes' />
        </div>

        <div className='form-line'></div>

        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Early Removal Fee' />
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Listing Fee' />
        </div>
        <div className='col-3'>
            <CurrencyInput labelPosition='top' title='Owner’s Asking Price' />
        </div>
    </div>
);
