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
    const { contact, contactExtData, changeContact, changeContactExtData } = store;

    useEffect(() => {
        if (id) {
            getContactsTypeList(id).then((response) => {
                response && setTypeList(response);
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
                    value={contactExtData.Buyer_Salutation}
                    options={titleList}
                    onChange={({ target: { value } }) => {
                        changeContactExtData("Buyer_Salutation", value);
                    }}
                    className='w-full general-info__dropdown'
                />
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.firstName}
                        onChange={({ target: { value } }) => changeContact("firstName", value)}
                    />
                    <label className='float-label'>First Name (required)</label>
                </span>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.lastName}
                        onChange={({ target: { value } }) => changeContact("lastName", value)}
                    />
                    <label className='float-label'>Last Name (required)</label>
                </span>
            </div>

            <div className='col-8'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.companyName}
                        onChange={({ target: { value } }) => changeContact("companyName", value)}
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
                    onChange={({ target: { value } }) => changeContact("type", value)}
                    placeholder='Type (required)'
                    className='w-full general-info__dropdown'
                />
            </div>
        </div>
    );
});
