import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";

export const ContactsGeneralInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;
    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Title'
                    //TODO: add missing contact.title
                    className='w-full general-info__dropdown'
                />
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact?.firstName}
                    />
                    <label className='float-label'>First Name (required)</label>
                </span>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.lastName}
                    />
                    <label className='float-label'>Last Name (required)</label>
                </span>
            </div>

            <div className='col-8'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.companyName}
                    />
                    <label className='float-label'>Business Name</label>
                </span>
            </div>

            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    value={contact.type}
                    filter
                    //TODO: missing options
                    placeholder='Type (required)'
                    className='w-full general-info__dropdown'
                />
            </div>
        </div>
    );
});
