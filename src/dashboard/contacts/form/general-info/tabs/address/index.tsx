import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";
import { Checkbox } from "primereact/checkbox";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";

interface ContactsAddressInfoProps {
    type?: GENERAL_CONTACT_TYPE.BUYER | GENERAL_CONTACT_TYPE.CO_BUYER;
}

export const ContactsAddressInfo = observer(({ type }: ContactsAddressInfoProps): ReactElement => {
    const store = useStore().contactStore;
    const { contact, changeContact } = store;
    const [isSameAsMailing, setIsSameAsMailing] = useState<boolean>(true);

    return (
        <div className='grid address-info row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={contact.streetAddress || ""}
                        onChange={({ target: { value } }) => changeContact("streetAddress", value)}
                    />
                    <label className='float-label'>Street Address</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='label'
                    optionValue='id'
                    filter
                    placeholder='State'
                    value={contact.state || ""}
                    options={STATES_LIST}
                    onChange={({ target: { value } }) => changeContact("state", value)}
                    className='w-full address-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={contact.city || ""}
                        onChange={({ target: { value } }) => changeContact("city", value)}
                    />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='address-info__text-input w-full'
                        value={contact.ZIP || ""}
                        onChange={({ target: { value } }) => changeContact("ZIP", value)}
                    />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
            <div className='col-12 grid'>
                <div className='col-9 text-line'>
                    <h3 className='text-line__title m-0 pr-3'>Mailing address</h3>
                    <hr className='text-line__line flex-1' />
                </div>
                <div className='col-3'>
                    <div className='flex px-2'>
                        <Checkbox
                            inputId='contact-same-address'
                            className='mt-1'
                            name='contact-same-address'
                            checked={isSameAsMailing}
                            onChange={() => setIsSameAsMailing(!isSameAsMailing)}
                        />
                        <label htmlFor='contact-same-address' className='ml-2'>
                            Same as primary address
                        </label>
                    </div>
                </div>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='mailing-address-info__text-input w-full'
                        value={contact.mailStreetAddress || ""}
                        onChange={({ target: { value } }) =>
                            store.changeContact("mailStreetAddress", value)
                        }
                    />
                    <label className='float-label'>Street address</label>
                </span>
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='label'
                    optionValue='id'
                    filter
                    placeholder='State'
                    value={contact.mailState || ""}
                    onChange={({ target: { value } }) => store.changeContact("mailState", value)}
                    options={STATES_LIST}
                    className='w-full mailing-address-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='mailing-address-info__text-input w-full'
                        value={contact.mailCity || ""}
                        onChange={({ target: { value } }) => store.changeContact("mailCity", value)}
                    />
                    <label className='float-label'>City</label>
                </span>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='mailing-address-info__text-input w-full'
                        value={contact.mailZIP || ""}
                        onChange={({ target: { value } }) => store.changeContact("mailZIP", value)}
                    />
                    <label className='float-label'>Zip Code</label>
                </span>
            </div>
        </div>
    );
});
