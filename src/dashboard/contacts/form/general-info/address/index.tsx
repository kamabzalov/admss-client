import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";

export const ContactsAddressInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;

    return (
        <div className='grid address-info row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={contact?.streetAddress}
                    />
                    <label className='float-label'>Street Address</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='id'
                    filter
                    placeholder='State'
                    value={contact?.state}
                    options={STATES_LIST}
                    className='w-full address-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='address-info__text-input w-full' value={contact?.city} />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='address-info__text-input w-full' value={contact?.ZIP} />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
        </div>
    );
});
