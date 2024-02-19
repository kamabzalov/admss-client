import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";

export const ContactsWorkplace = observer((): ReactElement => {
    return (
        <div className='grid contacts-workplace row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-workplace__text-input w-full' />
                    <label className='float-label'>Employer</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-workplace__text-input w-full' />
                    <label className='float-label'>Contact Name</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-workplace__text-input w-full' />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-workplace__text-input w-full' />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
        </div>
    );
});
