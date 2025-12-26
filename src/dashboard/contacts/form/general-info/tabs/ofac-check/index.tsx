/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement, useMemo, useState, useEffect } from "react";
import "./index.css";
import { useParams } from "react-router-dom";
import { checkContactOFAC } from "http/services/contacts-service";
import { Contact, ContactOFAC, OFAC_CHECK_STATUS } from "common/models/contact";
import { Status } from "common/models/base-response";
import { BUYER_ID, GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";
import {
    OFACCheckFailedLayout,
    OFACCheckPassedLayout,
} from "dashboard/contacts/form/general-info/tabs/ofac-check/ofac-layouts";
import { useStore } from "store/hooks";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { useToastMessage } from "common/hooks";

interface ContactsOfacCheckProps {
    type?: GENERAL_CONTACT_TYPE.BUYER | GENERAL_CONTACT_TYPE.CO_BUYER;
}

export const ContactsOfacCheck = observer(({ type }: ContactsOfacCheckProps): ReactElement => {
    const { id } = useParams();
    const { showError } = useToastMessage();
    const store = useStore().contactStore;
    const { contactOFAC, contact, contactFullInfo, contactExtData } = store;
    const [dialogShow, setDialogShow] = useState<boolean>(false);

    const isControlDisabled = useMemo(
        () => type === GENERAL_CONTACT_TYPE.CO_BUYER && contact.type !== BUYER_ID,
        [type, contact.type]
    );

    const handleOfacCheck = async () => {
        let contactData: Partial<Contact> = {} as Contact;

        if (type === GENERAL_CONTACT_TYPE.CO_BUYER) {
            contactData = {
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
            if (!contactData.firstName || !contactData.lastName) {
                return;
            }
        } else {
            if (!contact.firstName || !contact.lastName) {
                return;
            }
            contactData = contactFullInfo;
        }
        const response = await checkContactOFAC(id, contactData as Contact);
        if (response?.status === Status.ERROR) {
            showError(response.error);
        } else {
            const ofac = response as ContactOFAC;
            if (ofac?.check_status === OFAC_CHECK_STATUS.FAILED) {
                setDialogShow(true);
            }
            store.contactOFAC = response as ContactOFAC;
        }
    };

    useEffect(() => {
        if (!isControlDisabled) {
            handleOfacCheck();
        }
    }, []);

    useEffect(() => {
        if (type === GENERAL_CONTACT_TYPE.CO_BUYER) {
            if (!contactExtData.CoBuyer_First_Name || !contactExtData.CoBuyer_Last_Name) {
                store.contactOFAC = {} as ContactOFAC;
            }
        }
    }, [contactExtData.CoBuyer_First_Name, contactExtData.CoBuyer_Last_Name, type]);

    useEffect(() => {
        if (type !== GENERAL_CONTACT_TYPE.CO_BUYER) {
            if (!contact.firstName || !contact.lastName) {
                store.contactOFAC = {} as ContactOFAC;
            }
        }
    }, [contact.firstName, contact.lastName, type]);

    return (
        <div className='grid ofac-check row-gap-2'>
            <div className='col-3 px-0'>
                <Button
                    label='Check'
                    className='ofac-check__button'
                    onClick={handleOfacCheck}
                    outlined
                    type='button'
                    disabled={isControlDisabled}
                />
            </div>

            <div className='col-12 ofac-check__field'>
                {contactOFAC?.check_status === OFAC_CHECK_STATUS.PASSED && (
                    <OFACCheckPassedLayout />
                )}
                {contactOFAC?.check_status === OFAC_CHECK_STATUS.FAILED && (
                    <OFACCheckFailedLayout info={contactOFAC} />
                )}
            </div>
            {dialogShow && (
                <ConfirmModal
                    position='top'
                    icon='pi pi-exclamation-triangle'
                    title='OFAC match found!'
                    className='ofac-modal'
                    visible={dialogShow}
                    onHide={() => setDialogShow(false)}
                    acceptLabel='OK'
                    rejectClassName='hidden'
                    bodyMessage='Please visit the OFAC CHECK page for further details.'
                />
            )}
        </div>
    );
});
