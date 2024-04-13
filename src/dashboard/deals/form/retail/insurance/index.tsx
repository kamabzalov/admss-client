import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { InputText } from "primereact/inputtext";
import { BorderedCheckbox, CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { InputTextarea } from "primereact/inputtextarea";

export const DealRetailInsurance = observer((): ReactElement => {
    return (
        <div className='grid deal-retail-insurance row-gap-2'>
            <div className='col-6'>
                <CompanySearch name='Insurance Company' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Policy Number</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Insurance Co#</label>
                </span>
            </div>

            <div className='col-3'>
                <DateInput name='Effective Date' />
            </div>
            <div className='col-3'>
                <DateInput name='Expiration Date' />
            </div>
            <div className='col-3'>
                <BorderedCheckbox checked={false} name='Policy received' />
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch name="Agent's Name" />
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Agent's Address</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Coverage Comprehencive' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Coverage Collision' />
            </div>
            <div className='col-2'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Liability Row</label>
                </span>
            </div>
            <div className='col-2'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Liability Row</label>
                </span>
            </div>
            <div className='col-2'>
                <span className='p-float-label'>
                    <InputText className='deal-insurance__text-input w-full' />
                    <label className='float-label'>Liability Row</label>
                </span>
            </div>

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea className='deal-insurance__text-area' />
                    <label className='float-label'>Notes</label>
                </span>
            </div>
        </div>
    );
});
