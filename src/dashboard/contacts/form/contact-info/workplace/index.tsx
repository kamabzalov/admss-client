import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const ContactsWorkplace = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;
    return (
        <div className='grid contacts-workplace row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contactExtData.Buyer_Emp_Company}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("Buyer_Emp_Company", value);
                        }}
                    />
                    <label className='float-label'>Employer</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contactExtData.Buyer_Emp_Contact}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("Buyer_Emp_Contact", value);
                        }}
                    />

                    <label className='float-label'>Contact Name</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contactExtData.Buyer_Emp_Ext}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("Buyer_Emp_Ext", value);
                        }}
                    />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contactExtData.Buyer_Emp_Phone}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("Buyer_Emp_Phone", value);
                        }}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
        </div>
    );
});
