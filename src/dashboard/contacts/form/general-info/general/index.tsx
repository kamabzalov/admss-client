import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import "./index.css";

export const ContactsGeneralInfo = observer((): ReactElement => {
    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Title'
                    className='w-full general-info__dropdown'
                />
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText className='general-info__text-input w-full' />
                    <label className='float-label'>First Name (required)</label>
                </span>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText className='general-info__text-input w-full' />
                    <label className='float-label'>Last Name (required)</label>
                </span>
            </div>

            <div className='col-8'>
                <span className='p-float-label'>
                    <InputText className='general-info__text-input w-full' />
                    <label className='float-label'>Business Name</label>
                </span>
            </div>

            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Type (required)'
                    className='w-full general-info__dropdown'
                />
            </div>
        </div>
    );
});
