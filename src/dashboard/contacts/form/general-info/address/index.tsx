import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";

export const ContactsAddressInfo = observer((): ReactElement => {
    return (
        <div className='grid address-info row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='address-info__text-input w-full' />
                    <label className='float-label'>Street Address</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='State'
                    className='w-full address-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='address-info__text-input w-full' />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='address-info__text-input w-full' />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
        </div>
    );
});
