import {
    BorderedCheckbox,
    CurrencyInput,
    DateInput,
    SearchInput,
} from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";

export const PurchaseConsign = (): ReactElement => (
    <div className='grid purchase-consign row-gap-2'>
        <div className='col-3'>
            <div className='purchase-consign__checkbox flex'>
                <Checkbox
                    inputId='consign-vehicle'
                    name='consign-vehicle'
                    className='mt-1'
                    onChange={() => {}}
                    checked={false}
                />
                <label htmlFor='consign-vehicle' className='ml-2'>
                    Vehicle is Consigned
                </label>
            </div>
        </div>
        <div className='col-6'>
            <SearchInput name='Floor' title='Consignor' />
        </div>
        <div className='col-3'>
            <DateInput name='Consign Date' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-consign__text-input w-full' />
                <label className='float-label'>Net To Owner</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-consign__text-input w-full' />
                <label className='float-label'># Days</label>
            </span>
        </div>
        <div className='col-3'>
            <CurrencyInput name='Consignment Fee' />
        </div>

        <div className='form-line'></div>

        <div className='col-3'>
            <div className='purchase-consign__checkbox flex'>
                <Checkbox
                    inputId='consign-vehicle'
                    name='consign-vehicle'
                    className='mt-1'
                    onChange={() => {}}
                    checked={false}
                />
                <label htmlFor='consign-vehicle' className='ml-2'>
                    Returned to Seller Unsold
                </label>
            </div>
        </div>
        <div className='col-3'>
            <DateInput name='Return Date' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-consign__text-input w-full' />
                <label className='float-label'>Reserve Factor</label>
            </span>
        </div>
        <div className='col-3'>
            <CurrencyInput name='Reserve Amount' />
        </div>
        <div className='col-12'>
            <InputTextarea
                className='purchase-consign__text-area'
                placeholder='Consignment Notes'
            />
        </div>

        <div className='form-line'></div>

        <div className='col-3'>
            <CurrencyInput name='Reserve Amount' />
        </div>
        <div className='col-3'>
            <CurrencyInput name='Reserve Amount' />
        </div>
        <div className='col-3'>
            <CurrencyInput name='Reserve Amount' />
        </div>
    </div>
);
