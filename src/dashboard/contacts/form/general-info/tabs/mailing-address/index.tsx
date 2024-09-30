import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";

export const ContactsMailingAddressInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;
    return (
        <div className='grid mailing-address-info row-gap-2'>
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
