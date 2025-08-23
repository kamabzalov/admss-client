import { observer } from "mobx-react-lite";
import { ReactElement, useRef, useState, useMemo } from "react";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";
import { Contact, ContactExtData, ContactOFAC, ScanBarcodeDL } from "common/models/contact";
import { checkContactOFAC, scanContactDL } from "http/services/contacts-service";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { TextInput } from "dashboard/common/form/inputs";
import { useFormikContext } from "formik";
import { parseCustomDate } from "common/helpers";
import { SexList } from "common/constants/contract-options";
import { TOOLTIP_MESSAGE } from "dashboard/contacts/form/general-info/tabs/general";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { Loader } from "dashboard/common/loader";

export const ContactsGeneralCoBuyerInfo = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().contactStore;
    const { contactExtData, changeContactExtData } = store;

    const { setFieldValue, validateField, setFieldTouched, errors } =
        useFormikContext<ContactExtData>();
    const toast = useToast();
    const [allowOverwrite, setAllowOverwrite] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isScanning, setIsScanning] = useState<boolean>(false);

    const shouldDisableNameFields = useMemo(() => {
        return (
            !!contactExtData.CoBuyer_Emp_Company && contactExtData.CoBuyer_Emp_Company.trim() !== ""
        );
    }, [contactExtData.CoBuyer_Emp_Company]);

    const shouldDisableBusinessName = useMemo(() => {
        return !!(
            contactExtData.CoBuyer_First_Name?.trim() ||
            contactExtData.CoBuyer_Middle_Name?.trim() ||
            contactExtData.CoBuyer_Last_Name?.trim()
        );
    }, [
        contactExtData.CoBuyer_First_Name,
        contactExtData.CoBuyer_Middle_Name,
        contactExtData.CoBuyer_Last_Name,
    ]);

    const handleScanDL = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsScanning(true);

        try {
            const response = await scanContactDL(file);

            if (!response) {
                await Promise.reject("No response from server");
                return;
            }

            if (response.status === Status.ERROR) {
                await Promise.reject(response.error || "Failed to scan DL");
                return;
            }

            const { contact } = response as ScanBarcodeDL;
            if (!contact) {
                await Promise.reject("Failed to parse driver license data");
                return;
            }

            const {
                firstName,
                lastName,
                middleName,
                ZIP,
                city,
                streetAddress,
                state,
                sex,
                dl_number,
                dob,
                exp,
            } = contact;

            if (allowOverwrite) {
                changeContactExtData([
                    ["CoBuyer_First_Name", firstName],
                    ["CoBuyer_Last_Name", lastName],
                    ["CoBuyer_Middle_Name", middleName],
                    ["CoBuyer_Zip_Code", ZIP],
                    ["CoBuyer_City", city],
                    ["CoBuyer_Res_Address", streetAddress],
                    ["CoBuyer_State", state],
                    ["CoBuyer_Sex", SexList.find((item) => item?.id === Number(sex))?.name || ""],
                    ["CoBuyer_DL_State", state],
                    ["CoBuyer_Driver_License_Num", dl_number],
                ]);

                const dobTimestamp = parseCustomDate(dob);
                changeContactExtData("CoBuyer_Date_Of_Birth", dobTimestamp);

                const expTimestamp = parseCustomDate(exp);
                changeContactExtData("CoBuyer_DL_Exp_Date", expTimestamp);

                if (firstName || lastName || middleName) {
                    setFieldValue("CoBuyer_Emp_Company", "");
                    changeContactExtData("CoBuyer_Emp_Company", "");
                }
            } else {
                const fieldsToUpdate = {
                    CoBuyer_First_Name: firstName,
                    CoBuyer_Last_Name: lastName,
                    CoBuyer_Middle_Name: middleName,
                    CoBuyer_Zip_Code: ZIP,
                    CoBuyer_City: city,
                    CoBuyer_Res_Address: streetAddress,
                    CoBuyer_State: state,
                    CoBuyer_Sex: SexList.find((item) => item?.id === Number(sex))?.name || "",
                    CoBuyer_DL_State: state,
                    CoBuyer_Driver_License_Num: dl_number,
                    CoBuyer_Date_Of_Birth: parseCustomDate(dob),
                    CoBuyer_DL_Exp_Date: parseCustomDate(exp),
                };

                const updates = (
                    Object.entries(fieldsToUpdate) as [keyof ContactExtData, string | number][]
                ).filter(([key]) => !contactExtData?.[key]);

                !!updates.length && changeContactExtData(updates);
            }
            handleOfacCheck();
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail:
                    error instanceof Error
                        ? error.message
                        : "Failed to parse date from driver license",
                life: TOAST_LIFETIME,
            });
        } finally {
            setIsScanning(false);
            event.target.value = "";
        }
    };

    const handleOfacCheck = async () => {
        if (!contactExtData.CoBuyer_First_Name || !contactExtData.CoBuyer_Last_Name) {
            return;
        }

        const contactData: Partial<Contact> = {
            firstName: contactExtData.CoBuyer_First_Name,
            lastName: contactExtData.CoBuyer_Last_Name,
            middleName: contactExtData.CoBuyer_Middle_Name,
            ZIP: contactExtData.CoBuyer_Zip_Code,
            city: contactExtData.CoBuyer_City,
            streetAddress: contactExtData.CoBuyer_Res_Address,
            state: contactExtData.CoBuyer_State,
            sex: contactExtData.CoBuyer_Sex,
            dl_number: contactExtData.CoBuyer_Driver_License_Num,
            dob: contactExtData.CoBuyer_Date_Of_Birth,
            exp: contactExtData.CoBuyer_DL_Exp_Date,
        };
        const response = await checkContactOFAC(id, contactData as Contact);
        if (response?.status === Status.ERROR) {
            toast.current?.show({
                severity: "error",
                summary: Status.ERROR,
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            store.coBuyerContactOFAC = response as ContactOFAC;
        }
    };

    return (
        <div className='grid general-info row-gap-2'>
            <div className='col-12 flex gap-4'>
                <Button
                    type='button'
                    label={isScanning ? "Scanning" : "Scan driver license"}
                    className={`general-info__button ${isScanning ? "general-info__button--loading" : ""}`}
                    tooltip='Data received from the DL’s backside will fill in related fields'
                    outlined={!isScanning}
                    onClick={handleScanDL}
                    loading={isScanning}
                    loadingIcon={<Loader size='small' includeText={false} color='white' />}
                />
                <input
                    type='file'
                    accept='image/*'
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
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
                        tooltip="Data received from the DL's backside will overwrite user-entered data"
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
                    className={`general-info__text-input w-full ${store.isCoBuyerFieldsFilled && (!contactExtData.CoBuyer_First_Name || !contactExtData.CoBuyer_First_Name.trim()) ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_First_Name || ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("CoBuyer_First_Name", value, true).then(() => {
                            changeContactExtData("CoBuyer_First_Name", value);
                            validateField("CoBuyer_First_Name");
                        });
                    }}
                    onBlur={handleOfacCheck}
                    name={`First Name${store.isCoBuyerFieldsFilled ? " (required)" : ""}`}
                    tooltip={shouldDisableNameFields ? TOOLTIP_MESSAGE.PERSON : ""}
                    disabled={shouldDisableNameFields}
                    clearButton
                />
                <small className='p-error'>
                    {store.isCoBuyerFieldsFilled &&
                    (!contactExtData.CoBuyer_First_Name ||
                        !contactExtData.CoBuyer_First_Name.trim())
                        ? ERROR_MESSAGES.REQUIRED
                        : ""}
                </small>
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
                            setFieldTouched("CoBuyer_Middle_Name", true, true);
                        });
                    }}
                    tooltip={shouldDisableNameFields ? TOOLTIP_MESSAGE.PERSON : ""}
                    disabled={shouldDisableNameFields}
                    clearButton
                />
                <small className='p-error'>{errors.CoBuyer_Middle_Name || ""}</small>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    name={`Last Name${store.isCoBuyerFieldsFilled ? " (required)" : ""}`}
                    className={`general-info__text-input w-full ${store.isCoBuyerFieldsFilled && (!contactExtData.CoBuyer_Last_Name || !contactExtData.CoBuyer_Last_Name.trim()) ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_Last_Name || ""}
                    onChange={({ target: { value } }) => {
                        setFieldValue("CoBuyer_Last_Name", value, true).then(() => {
                            changeContactExtData("CoBuyer_Last_Name", value);
                            validateField("CoBuyer_Last_Name");
                        });
                    }}
                    onBlur={handleOfacCheck}
                    tooltip={shouldDisableNameFields ? TOOLTIP_MESSAGE.PERSON : ""}
                    disabled={shouldDisableNameFields}
                    clearButton
                />
                <small className='p-error'>
                    {store.isCoBuyerFieldsFilled &&
                    (!contactExtData.CoBuyer_Last_Name || !contactExtData.CoBuyer_Last_Name.trim())
                        ? ERROR_MESSAGES.REQUIRED
                        : ""}
                </small>
            </div>

            <div className='col-4 relative'>
                <TextInput
                    name={`Business Name${store.isCoBuyerFieldsFilled && !shouldDisableBusinessName ? " (required)" : ""}`}
                    className={`general-info__text-input w-full ${store.isCoBuyerFieldsFilled && !shouldDisableBusinessName && (!contactExtData.CoBuyer_Emp_Company || !contactExtData.CoBuyer_Emp_Company.trim()) ? "p-invalid" : ""}`}
                    value={contactExtData.CoBuyer_Emp_Company || ""}
                    onChange={({ target: { value } }) => {
                        changeContactExtData("CoBuyer_Emp_Company", value);
                        setFieldValue("CoBuyer_Emp_Company", value);
                    }}
                    tooltip={shouldDisableBusinessName ? TOOLTIP_MESSAGE.BUSINESS : ""}
                    disabled={shouldDisableBusinessName}
                    clearButton
                />
                <small className='p-error'>
                    {store.isCoBuyerFieldsFilled &&
                    !shouldDisableBusinessName &&
                    (!contactExtData.CoBuyer_Emp_Company ||
                        !contactExtData.CoBuyer_Emp_Company.trim())
                        ? ERROR_MESSAGES.REQUIRED
                        : ""}
                </small>
            </div>
        </div>
    );
});
