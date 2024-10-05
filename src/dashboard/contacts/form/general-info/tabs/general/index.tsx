import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useRef, useState } from "react";
import "./index.css";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";
import { Contact, ContactType } from "common/models/contact";
import { getContactsTypeList, scanContactDL } from "http/services/contacts-service";
import { useFormikContext } from "formik";
import { REQUIRED_COMPANY_TYPE_INDEXES } from "dashboard/contacts/form";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";

interface ContactsGeneralInfoProps {
    type?: "buyer" | "co-buyer";
}

export const ContactsGeneralInfo = observer(({ type }: ContactsGeneralInfoProps): ReactElement => {
    const { id } = useParams();
    const [typeList, setTypeList] = useState<ContactType[]>([]);
    const store = useStore().contactStore;
    const { contact, changeContact } = store;
    const toast = useToast();
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { errors, setFieldValue } = useFormikContext<Contact>();

    useEffect(() => {
        getContactsTypeList(id || "0").then((response) => {
            if (response) {
                const types = response as ContactType[];
                setTypeList(types);
            }
        });
    }, [id]);

    const handleScanDL = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            scanContactDL(file).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response.error,
                        life: TOAST_LIFETIME,
                    });
                }
            });
            event.target.value = "";
        }
    };

    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-3'>
                <Button
                    type='button'
                    label='Scan driver license'
                    className='general-info__button'
                    outlined
                    onClick={handleScanDL}
                />
                <input
                    type='file'
                    accept='image/*'
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>
            <div className='col-9'>
                <div className='general-info-overwrite pb-3'>
                    <Checkbox
                        checked={allowOverwrite}
                        inputId='general-info-overwrite'
                        className='general-info-overwrite__checkbox'
                        onChange={() => setAllowOverwrite(!allowOverwrite)}
                    />
                    <label
                        htmlFor='general-info-overwrite'
                        className='pl-3 general-info-overwrite__label'
                    >
                        Overwrite data
                    </label>
                    <Button
                        text
                        tooltip='Data received from the DL’s backside will overwrite user-entered data'
                        icon='icon adms-help'
                        type='button'
                        severity='info'
                        className='general-info-overwrite__icon transparent'
                    />
                </div>
            </div>
            <div className='col-12 grid'>
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
                    <label className='float-label'>
                        First Name
                        {!REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type) && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.firstName}</small>
            </div>

            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={contact.middleName || ""}
                        onChange={({ target: { value } }) => {
                            changeContact("middleName", value);
                        }}
                    />
                    <label className='float-label'>Middle Name</label>
                </span>
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
                    <label className='float-label'>
                        Last Name
                        {!REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type) && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.lastName}</small>
            </div>

            <div className='col-4'>
                <span className='p-float-label'>
                    <InputText
                        className={`general-info__text-input w-full ${
                            errors.businessName ? "p-invalid" : ""
                        }`}
                        value={contact.businessName || ""}
                        onChange={({ target: { value } }) => changeContact("businessName", value)}
                    />
                    <label className='float-label'>
                        Business Name
                        {REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type) && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.businessName}</small>
            </div>
        </div>
    );
});
