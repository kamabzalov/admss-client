import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { STATES_LIST } from "common/constants/states";
import { DateInput } from "dashboard/common/form/inputs";

export const DealRetailLiens = observer((): ReactElement => {
    return (
        <div className='grid deal-retail-liens row-gap-2'>
            <div className='col-6'>
                <CompanySearch name='Lessor' />
            </div>
            <div className='col-3'>
                <InputText placeholder='Phone Number' />
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='deal-liens__text-input w-full' />
                    <label className='float-label'>Address</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        options={STATES_LIST}
                        filter
                        className='w-full deal-liens__dropdown'
                    />
                    <label className='float-label'>State</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-liens__dropdown'
                    />
                    <label className='float-label'>City</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-liens__text-input w-full' />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <DateInput name='Date' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-liens__text-input w-full' />
                    <label className='float-label'>Account#</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-liens__text-input w-full' />
                    <label className='float-label'>Lesser ID#</label>
                </span>
            </div>
        </div>
    );
});
