import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";
import { ContactType } from "common/models/contact";
import { getContactsTypeList } from "http/services/contacts-service";

const titleList = [
    {
        name: "Mr.",
    },
    {
        name: "Mrs.",
    },
];

export const ContactsGeneralInfo = observer((): ReactElement => {
    const { id } = useParams();
    const [typeList, setTypeList] = useState<ContactType[]>([]);
    const store = useStore().contactStore;
    const { contact } = store;

    useEffect(() => {
        if (id) {
            getContactsTypeList(id).then((response) => {
                if (response) {
                    const types = response as ContactType[];
                    setTypeList(types);
                }
            });
        }
    }, [id]);

    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Title'
                    value={contact.extdata?.Buyer_Salutation}
                    options={titleList}
                    onChange={({ target: { value } }) => {}}
                    className='w-full general-info__dropdown'
                />
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact?.firstName}
                    />
                    <label className='float-label'>First Name (required)</label>
                </span>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.lastName}
                    />
                    <label className='float-label'>Last Name (required)</label>
                </span>
            </div>

            <div className='col-8'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.companyName}
                    />
                    <label className='float-label'>Business Name</label>
                </span>
            </div>

            <div className='col-4'>
                <Dropdown
                    optionLabel='name'
                    optionValue='id'
                    value={contact.type}
                    filter
                    options={typeList}
                    placeholder='Type (required)'
                    className='w-full general-info__dropdown'
                />
            </div>
        </div>
    );
});
