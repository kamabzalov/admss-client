import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CompanySearch } from "dashboard/contacts/common/company-search";
import { Dropdown } from "primereact/dropdown";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { InputTextarea } from "primereact/inputtextarea";

export const DealRetailProducts = observer((): ReactElement => {
    return (
        <div className='grid deal-retail-products row-gap-2'>
            <div className='col-6'>
                <CompanySearch name='Service Contract Company' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Price' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Deductible' />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-products__dropdown'
                    />
                    <label className='float-label'>Term (month or miles)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        className='w-full deal-products__dropdown'
                    />
                    <label className='float-label'>Duration</label>
                </span>
            </div>

            <div className='col-12'>
                <span className='p-float-label'>
                    <InputTextarea className='deal-products__text-area' />
                    <label className='float-label'>Notes</label>
                </span>
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <CompanySearch name='GAP Company' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Price' />
            </div>
        </div>
    );
});
