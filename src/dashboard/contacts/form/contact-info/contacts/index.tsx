import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { Button } from "primereact/button";

export const ContactsSocialInfo = observer((): ReactElement => {
    return (
        <div className='grid contacts-social row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='icon adms-add-item-round mr-2' />
                    Add another email address
                </Button>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='icon adms-add-item-round mr-2' />
                    Add another phone number
                </Button>
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>Facebook</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>WhatsApp</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>Slack</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText className='contacts-social__text-input w-full' />
                    <label className='float-label'>Skype</label>
                </span>
            </div>
        </div>
    );
});
