import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { Fragment, ReactElement } from "react";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";

export const ContactsSocialInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact, changeContact } = store;

    return (
        <div className='grid contacts-social row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.email1 || ""}
                        onChange={({ target: { value } }) => {
                            changeContact("email1", value);
                        }}
                    />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full' disabled>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another email address
                </Button>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.email2 || ""}
                        onChange={({ target: { value } }) => {
                            changeContact("email2", value);
                        }}
                    />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full' disabled>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another email address
                </Button>
            </div>

            {contact.emails &&
                contact.emails.map((email, index) => {
                    return (
                        index > 0 && (
                            <Fragment key={index}>
                                <div className='col-6'>
                                    <span className='p-float-label'>
                                        <InputText
                                            className='contacts-social__text-input w-full'
                                            value={email}
                                            onChange={(e) => {
                                                const newEmails = [...contact?.emails];
                                                newEmails[index] = e.target.value;
                                                changeContact("emails", newEmails);
                                            }}
                                        />
                                        <label className='float-label'>E-mail</label>
                                    </span>
                                </div>
                                <div className='col-6'>
                                    <Button
                                        className='w-full'
                                        disabled={!(contact?.emails[index]?.length - 1)}
                                        onClick={() =>
                                            changeContact("emails", [...contact?.emails, ""])
                                        }
                                    >
                                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                                        Add another email address
                                    </Button>
                                </div>
                            </Fragment>
                        )
                    );
                })}

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.phone1 || ""}
                        onChange={({ target: { value } }) => {
                            changeContact("phone1", value);
                        }}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full' disabled>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another phone number
                </Button>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.phone2 || ""}
                        onChange={({ target: { value } }) => {
                            changeContact("phone2", value);
                        }}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
            <div className='col-6'>
                <Button className='w-full' disabled>
                    <i className='pi pi-plus mr-2 text-xs pt-1' />
                    Add another phone number
                </Button>
            </div>

            {contact?.phones &&
                contact.phones.map((phone, index) => {
                    return (
                        index > 0 && (
                            <Fragment key={index}>
                                <div className='col-6'>
                                    <span className='p-float-label'>
                                        <InputText
                                            className='contacts-social__text-input w-full'
                                            value={phone}
                                            onChange={(e) => {
                                                const newPhones = [...contact?.phones];
                                                newPhones[index] = e.target.value;
                                                changeContact("phones", newPhones);
                                            }}
                                        />
                                        <label className='float-label'>Phone Number</label>
                                    </span>
                                </div>
                                <div className='col-6'>
                                    <Button
                                        className='w-full'
                                        disabled={!(contact?.phones[index]?.length - 1)}
                                        onClick={() =>
                                            changeContact("phones", [...contact?.phones, ""])
                                        }
                                    >
                                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                                        Add another phone number
                                    </Button>
                                </div>
                            </Fragment>
                        )
                    );
                })}

            <hr className='form-line' />

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.messager1 || ""}
                        onChange={(e) => changeContact("messager1", e.target.value)}
                    />
                    <label className='float-label'>Facebook</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.messager2 || ""}
                        onChange={(e) => changeContact("messager2", e.target.value)}
                    />
                    <label className='float-label'>WhatsApp</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.messager3 || ""}
                        onChange={(e) => changeContact("messager3", e.target.value)}
                    />
                    <label className='float-label'>Slack</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-social__text-input w-full'
                        value={contact.messager4 || ""}
                        onChange={(e) => changeContact("messager4", e.target.value)}
                    />
                    <label className='float-label'>Skype</label>
                </span>
            </div>
        </div>
    );
});
