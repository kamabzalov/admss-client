import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";

export const ContactsSocialInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;
    return (
        <div className='grid contacts-social row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.email1}
                    />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another email address
                </Button>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.phone1}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full'>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another phone number
                </Button>
            </div>

            <hr className='form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        //TODO: missing social values
                    />
                    <label className='float-label'>Facebook</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        //TODO: missing social values
                    />
                    <label className='float-label'>WhatsApp</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        //TODO: missing social values
                    />
                    <label className='float-label'>Slack</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        //TODO: missing social values
                    />
                    <label className='float-label'>Skype</label>
                </span>
            </div>
        </div>
    );
});
