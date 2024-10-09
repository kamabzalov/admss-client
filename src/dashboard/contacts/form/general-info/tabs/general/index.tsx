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
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";

const { BUYER, CO_BUYER } = GENERAL_CONTACT_TYPE;

interface ContactsGeneralInfoProps {
    type?: typeof BUYER | typeof CO_BUYER;
}

export const ContactsGeneralInfo = observer(({ type }: ContactsGeneralInfoProps): ReactElement => {
    const { id } = useParams();
    const [typeList, setTypeList] = useState<ContactType[]>([]);
    const store = useStore().contactStore;
    const { contact, changeContact, contactExtData, changeContactExtData } = store;
    const toast = useToast();
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { errors, setFieldValue } = useFormikContext<Contact>();

    const [savedFirstName, setSavedFirstName] = useState<string>("");
    const [savedLastName, setSavedLastName] = useState<string>("");
    const [savedMiddleName, setSavedMiddleName] = useState<string>("");
    const [savedBusinessName, setSavedBusinessName] = useState<string>("");

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

    const isBusinessNameRequired = REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type);

    const isNameFieldsFilled = () => {
        if (type === BUYER) {
            return contact.firstName?.trim() !== "" || contact.lastName?.trim() !== "";
        } else {
            return (
                contactExtData.CoBuyer_First_Name?.trim() !== "" ||
                contactExtData.CoBuyer_Last_Name?.trim() !== ""
            );
        }
    };

    const shouldDisableNameFields =
        isBusinessNameRequired || (contact.businessName && contact.businessName?.trim() !== "");

    const shouldDisableBusinessName = !isBusinessNameRequired && isNameFieldsFilled();

    useEffect(() => {
        if (shouldDisableNameFields) {
            if (type === BUYER) {
                setSavedFirstName(contact.firstName);
                setSavedLastName(contact.lastName);
                setSavedMiddleName(contact.middleName);
                setFieldValue("firstName", "");
                setFieldValue("lastName", "");
                changeContact("firstName", "");
                changeContact("lastName", "");
                changeContact("middleName", "");
            } else {
                setSavedFirstName(contactExtData.CoBuyer_First_Name);
                setSavedLastName(contactExtData.CoBuyer_Last_Name);
                setSavedMiddleName(contactExtData.CoBuyer_Middle_Name);
                changeContactExtData("CoBuyer_First_Name", "");
                changeContactExtData("CoBuyer_Last_Name", "");
                changeContactExtData("CoBuyer_Middle_Name", "");
            }
        } else {
            if (type === BUYER) {
                if (!contact.firstName && savedFirstName) {
                    setFieldValue("firstName", savedFirstName);
                    changeContact("firstName", savedFirstName);
                }
                if (!contact.lastName && savedLastName) {
                    setFieldValue("lastName", savedLastName);
                    changeContact("lastName", savedLastName);
                }
                if (!contact.middleName && savedMiddleName) {
                    changeContact("middleName", savedMiddleName);
                }
            } else {
                if (!contactExtData.CoBuyer_First_Name && savedFirstName) {
                    changeContactExtData("CoBuyer_First_Name", savedFirstName);
                }
                if (!contactExtData.CoBuyer_Last_Name && savedLastName) {
                    changeContactExtData("CoBuyer_Last_Name", savedLastName);
                }
                if (!contactExtData.CoBuyer_Middle_Name && savedMiddleName) {
                    changeContactExtData("CoBuyer_Middle_Name", savedMiddleName);
                }
            }
        }
    }, [shouldDisableNameFields, contact.businessName, contact.type, type]);

    useEffect(() => {
        if (shouldDisableBusinessName) {
            setSavedBusinessName(contact.businessName);
            setFieldValue("businessName", "");
            changeContact("businessName", "");
        } else {
            if (!contact.businessName && savedBusinessName) {
                setFieldValue("businessName", savedBusinessName);
                changeContact("businessName", savedBusinessName);
            }
        }
    }, [
        shouldDisableBusinessName,
        contact.firstName,
        contact.lastName,
        contactExtData.CoBuyer_First_Name,
        contactExtData.CoBuyer_Last_Name,
        contact.type,
        type,
    ]);

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
                        value={
                            (type === BUYER
                                ? contact.firstName
                                : contactExtData.CoBuyer_First_Name) || ""
                        }
                        onChange={({ target: { value } }) => {
                            if (type === BUYER) {
                                setFieldValue("firstName", value);
                                changeContact("firstName", value);
                            } else {
                                changeContactExtData("CoBuyer_First_Name", value);
                            }
                        }}
                        disabled={!!shouldDisableNameFields}
                    />
                    <label className='float-label'>
                        First Name
                        {!isBusinessNameRequired && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.firstName}</small>
            </div>

            <div className='col-4 relative'>
                <span className='p-float-label'>
                    <InputText
                        className='general-info__text-input w-full'
                        value={
                            (type === BUYER
                                ? contact.middleName
                                : contactExtData.CoBuyer_Middle_Name) || ""
                        }
                        onChange={({ target: { value } }) => {
                            if (type === BUYER) {
                                changeContact("middleName", value);
                            } else {
                                changeContactExtData("CoBuyer_Middle_Name", value);
                            }
                        }}
                        disabled={!!shouldDisableNameFields}
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
                        value={
                            (type === BUYER
                                ? contact.lastName
                                : contactExtData.CoBuyer_Last_Name) || ""
                        }
                        onChange={({ target: { value } }) => {
                            if (type === BUYER) {
                                setFieldValue("lastName", value);
                                changeContact("lastName", value);
                            } else {
                                changeContactExtData("CoBuyer_Last_Name", value);
                            }
                        }}
                        disabled={!!shouldDisableNameFields}
                    />
                    <label className='float-label'>
                        Last Name
                        {!isBusinessNameRequired && " (required)"}
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
                        disabled={shouldDisableBusinessName}
                    />
                    <label className='float-label'>
                        Business Name
                        {isBusinessNameRequired && " (required)"}
                    </label>
                </span>
                <small className='p-error'>{errors.businessName}</small>
            </div>
        </div>
    );
});
