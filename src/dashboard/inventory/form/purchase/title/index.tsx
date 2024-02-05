import { DateInput, SearchInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";

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
            <Dropdown placeholder='Status' filter className='w-full purchase-title__dropdown' />
        </div>
        <div className='col-3'>
            <Dropdown placeholder='State' filter className='w-full purchase-title__dropdown' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Number</label>
            </span>
        </div>

        <div className='col-3 flex align-items-center'>
            <div className='purchase-title__checkbox flex'>
                <Checkbox
                    inputId='title-vehicle'
                    name='title-vehicle'
                    className='mt-1'
                    onChange={() => {}}
                    checked={false}
                />
                <label htmlFor='title-vehicle' className='ml-2'>
                    Received
                </label>
            </div>
        </div>

        <div className='col-3'>
            <DateInput name='Date' />
        </div>

        <hr className='form-line' />

        <div className='col-6'>
            <SearchInput title='Holder Name' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Holder Phone Number</label>
            </span>
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Holder Payoff</label>
            </span>
        </div>

        <div className='col-6'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Holder Address</label>
            </span>
        </div>
        <div className='col-3'>
            <Dropdown placeholder='State' filter className='w-full' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Zip Code</label>
            </span>
        </div>

        <hr className='form-line' />

        <div className='col-6'>
            <SearchInput title='Previous Name' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Previous Phone Number</label>
            </span>
        </div>
        <div className='col-6'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Previous Address</label>
            </span>
        </div>
        <div className='col-3'>
            <Dropdown placeholder='State' filter className='w-full' />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='purchase-title__text-input w-full' />
                <label className='float-label'>Zip Code</label>
            </span>
        </div>
    </div>
);
