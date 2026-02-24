import { useFormikContext } from "formik";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";
import { ContactExtData } from "common/models/contact";
import { PhoneInput, TextInput } from "dashboard/common/form/inputs";

export const ContactsWorkplace = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;
    const { values, errors, touched, setFieldValue, setFieldTouched, handleBlur } =
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

            <div className='col-6 relative'>
                <TextInput
                    name='Buyer_Emp_Ext'
                    label='E-mail'
                    className={`contacts-workplace__text-input w-full ${
                        errors.Buyer_Emp_Ext ? "p-invalid" : ""
                    }`}
                    type='email'
                    onBlur={handleBlur}
                    value={values.Buyer_Emp_Ext || ""}
                    error={!!errors.Buyer_Emp_Ext}
                    errorMessage={errors.Buyer_Emp_Ext}
                    onChange={async ({ target: { value } }) => {
                        await setFieldValue("Buyer_Emp_Ext", value);
                        changeContactExtData("Buyer_Emp_Ext", value);
                        setFieldTouched("Buyer_Emp_Ext", true, true);
                    }}
                />
            </div>

            <div className='col-6 relative'>
                <PhoneInput
                    name='Phone Number'
                    className={`contacts-workplace__text-input w-full ${
                        errors.Buyer_Emp_Phone && touched.Buyer_Emp_Phone ? "p-invalid" : ""
                    }`}
                    onBlur={handleBlur}
                    value={contactExtData.Buyer_Emp_Phone}
                    onChange={async ({ target: { value } }) => {
                        await setFieldValue("Buyer_Emp_Phone", value);
                        changeContactExtData("Buyer_Emp_Phone", value);
                        setFieldTouched("Buyer_Emp_Phone", true, true);
                    }}
                />
            </div>
        </div>
    );
});
