import { observer } from "mobx-react-lite";
import { ReactElement, useMemo, useRef, useState } from "react";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";
import { ContactExtData, ContactOFAC } from "common/models/contact";
import { checkContactOFAC, scanContactDL } from "http/services/contacts-service";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { BUYER_ID } from "dashboard/contacts/form/general-info";
import { TextInput } from "dashboard/common/form/inputs";
import { useFormikContext } from "formik";

export const ContactsGeneralCoBuyerInfo = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().contactStore;
    const { contact, contactExtData, contactFullInfo, changeContactExtData } = store;

    const { errors, setFieldValue, validateField } = useFormikContext<ContactExtData>();
    const toast = useToast();
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const isControlDisabled = useMemo(() => contact.type !== BUYER_ID, [contact.type]);

    const handleOfacCheck = () => {
        if (!contactFullInfo.firstName || !contactFullInfo.lastName) {
            return;
        }
        checkContactOFAC(id, { ...contactFullInfo }).then((response) => {
            if (response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response.error,
                    life: TOAST_LIFETIME,
                });
            } else {
                store.contactOFAC = response as ContactOFAC;
            }
        });
    };

    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-3'>
                <Button
                    type='button'
                    label='Scan driver license'
                    className='general-info__button'
                    tooltip='Data received from the DL’s backside will fill in related fields'
                    disabled={isControlDisabled}
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
                        className='general-info-overwrite__label'
                    >
                        Overwrite data
                    </label>
                    <Button
                        text
                        tooltip='Data received from the DL’s backside will overwrite user-entered data'
                        icon='icon adms-help'
                        outlined
                        type='button'
                        className='general-info-overwrite__icon'
                        tooltipOptions={{
                            className: "overwrite-tooltip",
                        }}
                    />
                </div>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    className={`general-info__text-input w-full ${errors.CoBuyer_First_Name ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_First_Name || ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("CoBuyer_First_Name", value, true).then(() => {
                            changeContactExtData("CoBuyer_First_Name", value);
                            validateField("CoBuyer_First_Name");
                        });
                    }}
                    onBlur={handleOfacCheck}
                    name='First Name'
                    clearButton
                />

                <small className='p-error'>{errors.CoBuyer_First_Name}</small>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    name='Middle Name'
                    className={`general-info__text-input w-full ${errors.CoBuyer_Middle_Name ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_Middle_Name || ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("CoBuyer_Middle_Name", value, true).then(() => {
                            changeContactExtData("CoBuyer_Middle_Name", value);
                            validateField("CoBuyer_Middle_Name");
                        });
                    }}
                    clearButton
                />

                <small className='p-error'>{errors.CoBuyer_Middle_Name}</small>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    name='Last Name'
                    className={`general-info__text-input w-full ${errors.CoBuyer_Last_Name ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_Last_Name || ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("CoBuyer_Last_Name", value, true).then(() => {
                            changeContactExtData("CoBuyer_Last_Name", value);
                            validateField("CoBuyer_Last_Name");
                        });
                    }}
                    onBlur={handleOfacCheck}
                    clearButton
                />

                <small className='p-error'>{errors.CoBuyer_Last_Name}</small>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    name='Business Name'
                    className='general-info__text-input w-full'
                    value={contactExtData.CoBuyer_Emp_Company || ""}
                    onChange={({ target: { value } }) => {
                        return changeContactExtData("CoBuyer_Emp_Company", value);
                    }}
                    clearButton
                />
            </div>
        </div>
    );
});
