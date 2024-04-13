import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { Dropdown } from "primereact/dropdown";
import { DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";

export const DealGeneralSale = observer((): ReactElement => {
    return (
        <div className='grid deal-general-sale row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Buyer Name (required)</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Vehicle (required)</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>Type of Deal (required)</label>
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
                    <label className='float-label'>Sale status (required)</label>
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
                    <label className='float-label'>Sale type (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <DateInput name='Sale date (required)' />
            </div>
            <div className='col-3'>
                <DateInput name='First operated (req.)' />
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
                    <label className='float-label'>New or Used (req.)</label>
                </span>
            </div>

            <div className='col-12 text-line'>
                <h3 className='text-line__title m-0 pr-3'>Vehicle payments tracking</h3>
                <hr className='text-line__line flex-1' />
            </div>

            <div className='col-3'>
                <DateInput name='Warn Overdue After X Days' />
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-sale__text-input w-full' />
                    <label className='float-label'>Account number</label>
                </span>
            </div>

            <hr className='col-12 form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        required
                        className='w-full deal-sale__dropdown'
                    />
                    <label className='float-label'>How did you hear about us? (required)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='deal-sale__text-input w-full' />
                    <label className='float-label'>ROS SaleID (required)</label>
                </span>
            </div>
        </div>
    );
});
