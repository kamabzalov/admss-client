import { useFormikContext } from "formik";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";
import { ContactExtData } from "common/models/contact";
import { EmailInput, PhoneInput, TextInput } from "dashboard/common/form/inputs";

export const ContactsWorkplace = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;
    const { values, errors, setFieldValue, setFieldTouched, handleBlur } =
        useFormikContext<ContactExtData>();
    return (
        <div className='grid contacts-workplace row-gap-2'>
            <div className='col-6'>
                <TextInput
                    name='Buyer_Emp_Company'
                    label='Employer'
                    className='contacts-workplace__text-input w-full'
                    value={contactExtData.Buyer_Emp_Company || ""}
                    onChange={({ target: { value } }) => {
                        changeContactExtData("Buyer_Emp_Company", value);
                    }}
                />
            </div>
            <div className='col-6'>
                <TextInput
                    name='Buyer_Emp_Contact'
                    label='Contact Name'
                    className='contacts-workplace__text-input w-full'
                    value={contactExtData.Buyer_Emp_Contact || ""}
                    onChange={({ target: { value } }) => {
                        changeContactExtData("Buyer_Emp_Contact", value);
                    }}
                />
            </div>

            <EmailInput
                name='E-mail'
                colWidth={6}
                value={values.Buyer_Emp_Ext || ""}
                error={!!errors.Buyer_Emp_Ext}
                errorMessage={errors.Buyer_Emp_Ext}
                onChange={async ({ target: { value } }) => {
                    await setFieldValue("Buyer_Emp_Ext", value);
                    changeContactExtData("Buyer_Emp_Ext", value);
                    setFieldTouched("Buyer_Emp_Ext", true, true);
                }}
            />

            <PhoneInput
                name='Phone Number'
                colWidth={6}
                onBlur={handleBlur}
                value={contactExtData.Buyer_Emp_Phone || ""}
                onChange={async ({ target: { value } }) => {
                    await setFieldValue("Buyer_Emp_Phone", value);
                    changeContactExtData("Buyer_Emp_Phone", value);
                    setFieldTouched("Buyer_Emp_Phone", true, true);
                }}
                error={!!errors.Buyer_Emp_Phone}
                errorMessage={errors.Buyer_Emp_Phone}
            />
        </div>
    );
});
