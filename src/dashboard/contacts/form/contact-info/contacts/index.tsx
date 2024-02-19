import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement, useState } from "react";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";

export const ContactsSocialInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;
    const [emails, setEmails] = useState<string[]>([contact.emails[0]]);
    const [phones, setPhones] = useState<string[]>([contact.phones[0]]);

    return (
        <div className='grid contacts-social row-gap-2'>
            {emails.map((email, index) => {
                return (
                    <>
                        <div className='col-6'>
                            <span className='p-float-label'>
                                <InputText
                                    className='contacts-social__text-input w-full'
                                    value={email}
                                    onChange={(e) => {
                                        const newEmails = [...emails];
                                        newEmails[index] = e.target.value;
                                        setEmails(newEmails);
                                    }}
                                />
                                <label className='float-label'>E-mail</label>
                            </span>
                        </div>
                        <div className='col-6'>
                            <Button
                                className='w-full'
                                disabled={!emails[index].length}
                                onClick={() => setEmails([...emails, ""])}
                            >
                                <i className='pi pi-plus mr-2 text-xs pt-1' />
                                Add another email address
                            </Button>
                        </div>
                    </>
                );
            })}

            {phones.map((phone, index) => {
                return (
                    <>
                        <div className='col-6'>
                            <span className='p-float-label'>
                                <InputText
                                    className='contacts-social__text-input w-full'
                                    value={phone}
                                    onChange={(e) => {
                                        const newPhones = [...phones];
                                        newPhones[index] = e.target.value;
                                        setPhones(newPhones);
                                    }}
                                />
                                <label className='float-label'>Phone Number</label>
                            </span>
                        </div>
                        <div className='col-6'>
                            <Button
                                className='w-full'
                                disabled={!phones[index].length}
                                onClick={() => setPhones([...phones, ""])}
                            >
                                <i className='pi pi-plus mr-2 text-xs pt-1' />
                                Add another phone number
                            </Button>
                        </div>
                    </>
                );
            })}

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
