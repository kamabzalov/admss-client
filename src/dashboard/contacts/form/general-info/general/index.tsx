import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";
import { Contact, ContactType } from "common/models/contact";
import { getContactsTypeList } from "http/services/contacts-service";
import { useFormikContext } from "formik";
import { REQUIRED_COMPANY_TYPE_INDEXES } from "dashboard/contacts/form";

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

    const { errors, setFieldValue } = useFormikContext<Contact>();

    useEffect(() => {
        getContactsTypeList(id || "0").then((response) => {
            if (response) {
                const types = response as ContactType[];
                setTypeList(types);
            }
        });
    }, [id]);

    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-4'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='name'
                        filter
                        placeholder='Title'
                        value={contactExtData.Buyer_Salutation || ""}
                        options={titleList}
                        onChange={({ target: { value } }) => {
                            changeContactExtData("Buyer_Salutation", value);
                        }}
                        className='w-full general-info__dropdown'
                    />
                    <label className='float-label'>Title</label>
                </span>
            </div>

            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <InputText
                        className={`general-info__text-input w-full ${
                            errors.firstName ? "p-invalid" : ""
                        }`}
                        value={contact.firstName || ""}
                        onChange={({ target: { value } }) => {
                            setFieldValue("firstName", value);
                            changeContact("firstName", value);
                        }}
                    />
                    <label className='float-label'>First Name (required)</label>
                </span>
                <small className='p-error'>{errors.firstName}</small>
            </div>

            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <InputText
                        className={`general-info__text-input w-full ${
                            errors.lastName ? "p-invalid" : ""
                        }`}
                        value={contact.lastName || ""}
                        onChange={({ target: { value } }) => {
                            setFieldValue("lastName", value);
                            changeContact("lastName", value);
                        }}
                    />
                    <label className='float-label'>Last Name (required)</label>
                </span>
                <small className='p-error'>{errors.lastName}</small>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.businessName || ""}
                        onChange={({ target: { value } }) => changeContact("businessName", value)}
                    />
                    <label className='float-label'>Business Name</label>
                </span>
            </div>

            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        value={contact.type || 0}
                        filter
                        options={typeList}
                        onChange={(e) => {
                            setFieldValue("type", e.value);
                            changeContact("type", e.value);
                        }}
                        className={`w-full general-info__dropdown ${
                            errors.type ? "p-invalid" : ""
                        }`}
                    />
                    <label className='float-label'>Type (required)</label>
                </span>
                <small className='p-error'>{errors.type}</small>
            </div>
            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <InputText
                        className={`general-info__text-input w-full ${
                            errors.companyName ? "p-invalid" : ""
                        }`}
                        value={contact.companyName || ""}
                        onChange={({ target: { value } }) => {
                            setFieldValue("companyName", value);
                            changeContact("companyName", value);
                        }}
                    />
                    <label className='float-label'>
                        Company Name
                        {REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type) && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.companyName}</small>
            </div>
        </div>
    );
});

