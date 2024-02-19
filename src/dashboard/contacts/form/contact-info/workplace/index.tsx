import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const ContactsWorkplace = observer((): ReactElement => {
    const store = useStore().contactStore;
    const { contact } = store;
    return (
        <div className='grid contacts-workplace row-gap-2'>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contact.extdata.Buyer_Emp_Company}
                    />
                    <label className='float-label'>Employer</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contact.extdata.Buyer_Emp_Contact}
                    />
                    <label className='float-label'>Contact Name</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        //TODO: missing Buyer_Emp_Email
                    />
                    <label className='float-label'>E-mail</label>
                </span>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputText
                        className='contacts-workplace__text-input w-full'
                        value={contact.extdata.Buyer_Emp_Phone}
                    />
                    <label className='float-label'>Phone Number</label>
                </span>
            </div>
        </div>
    );
});
