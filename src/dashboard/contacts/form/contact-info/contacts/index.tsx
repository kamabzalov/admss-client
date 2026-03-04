import { EmailInput, PhoneInput, TextInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { InputTextProps } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { useFormikContext } from "formik";
import { Contact } from "common/models/contact";

interface SocialInputProps extends InputTextProps {
    social: "Facebook" | "WhatsApp" | "Slack" | "Microsoft Teams";
}

const SocialInput = (props: SocialInputProps): ReactElement => {
    const iconMap = {
        Facebook: "adms-facebook",
        WhatsApp: "adms-whatsapp",
        Slack: "adms-slack-01",
        "Microsoft Teams": "adms-msteams",
    };
    const currentIcon = iconMap[props.social];

    return (
        <span className='contact-social'>
            <TextInput
                {...props}
                name={props.social}
                label={props.social}
                className='contact-social__input contacts-social__text-input w-full'
            />
            <i className={`${currentIcon} contact-social__icon`} />
        </span>
    );
};

export const ContactsSocialInfo = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact, changeContact } = store;
    const { values, errors, setFieldValue, setFieldTouched, handleBlur } =
        useFormikContext<Contact>();
    const [anotherEmail, setAnotherEmail] = useState<boolean>(false);
    const [anotherPhone, setAnotherPhone] = useState<boolean>(false);

    useEffect(() => {
        setAnotherEmail(!!contact.email2?.length);
    }, [contact.email2?.length]);

    useEffect(() => {
        setAnotherPhone(!!contact.phone2?.length);
    }, [contact.phone2?.length]);

    return (
        <div className='grid contacts-social row-gap-2'>
            <EmailInput
                name='E-mail address'
                colWidth={6}
                value={values.email1 || ""}
                error={!!errors.email1}
                errorMessage={errors.email1}
                onChange={async ({ target: { value } }) => {
                    await setFieldValue("email1", value);
                    changeContact("email1", value);
                    setFieldTouched("email1", true, true);
                }}
            />
            {anotherEmail ? (
                <EmailInput
                    name='E-mail address'
                    colWidth={6}
                    value={values.email2 || ""}
                    error={!!errors.email2}
                    errorMessage={errors.email2}
                    onChange={async ({ target: { value } }) => {
                        await setFieldValue("email2", value);
                        changeContact("email2", value);
                        setFieldTouched("email2", true, true);
                    }}
                />
            ) : (
                <div className='col-6'>
                    <Button
                        type='button'
                        className='contacts__button'
                        onClick={() => setAnotherEmail(true)}
                        outlined
                    >
                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                        Add another email address
                    </Button>
                </div>
            )}

            <PhoneInput
                name='Phone Number'
                colWidth={6}
                onBlur={handleBlur}
                value={contact.phone1 ?? ""}
                onChange={async ({ target: { value } }) => {
                    await setFieldValue("phone1", value);
                    changeContact("phone1", value);
                    setFieldTouched("phone1", true, true);
                }}
            />
            {anotherPhone ? (
                <PhoneInput
                    name='Phone Number'
                    colWidth={6}
                    onBlur={handleBlur}
                    value={contact.phone2 ?? ""}
                    onChange={async ({ target: { value } }) => {
                        if (!value?.length) setAnotherPhone(false);
                        await setFieldValue("phone2", value);
                        changeContact("phone2", value);
                        setFieldTouched("phone2", true, true);
                    }}
                />
            ) : (
                <div className='col-6'>
                    <Button
                        type='button'
                        className='contacts__button'
                        outlined
                        onClick={() => setAnotherPhone(true)}
                    >
                        <i className='pi pi-plus mr-2 text-xs pt-1' />
                        Add another phone number
                    </Button>
                </div>
            )}

            <hr className='form-line' />

            <div className='col-6'>
                <SocialInput
                    social='Facebook'
                    value={contact.messager1}
                    onChange={({ target: { value } }) => changeContact("messager1", value)}
                />
            </div>
            <div className='col-6'>
                <SocialInput
                    social='WhatsApp'
                    value={contact.messager2}
                    onChange={({ target: { value } }) => changeContact("messager2", value)}
                />
            </div>

            <div className='col-6'>
                <SocialInput
                    social={"Slack"}
                    value={contact.messager3}
                    onChange={({ target: { value } }) => changeContact("messager3", value)}
                />
            </div>

            <div className='col-6'>
                <SocialInput
                    social={"Microsoft Teams"}
                    value={contact.messager4}
                    onChange={({ target: { value } }) => changeContact("messager4", value)}
                />
            </div>
        </div>
    );
});
