/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement, useState } from "react";
import "./index.css";
import { useParams } from "react-router-dom";
import { checkContactOFAC } from "http/services/contacts-service";
import { ContactOFAC, OFAC_CHECK_STATUS } from "common/models/contact";
import { Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";
import { OFACCheckFailedLayout, OFACCheckPassedLayout } from "./ofac-layouts";

interface ContactsOfacCheckProps {
    type?: GENERAL_CONTACT_TYPE.BUYER | GENERAL_CONTACT_TYPE.CO_BUYER;
}

export const ContactsOfacCheck = observer(({ type }: ContactsOfacCheckProps): ReactElement => {
    const { id } = useParams();
    const toast = useToast();
    const [contactOFAC, setContactOFAC] = useState<ContactOFAC>({} as ContactOFAC);

    const handleOfacCheck = () => {
        checkContactOFAC(id).then((response) => {
            if (response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response.error,
                    life: TOAST_LIFETIME,
                });
            } else {
                setContactOFAC(response as ContactOFAC);
            }
        });
    };

    return (
        <div className='grid ofac-check row-gap-2'>
            <div className='col-3 px-0'>
                <Button
                    label='Check'
                    className='ofac-check__button'
                    onClick={handleOfacCheck}
                    outlined
                    type='button'
                />
            </div>

            <div className='col-12 ofac-check__field'>
                {contactOFAC.check_status === OFAC_CHECK_STATUS.PASSED && <OFACCheckPassedLayout />}
                {contactOFAC.check_status === OFAC_CHECK_STATUS.FAILED && (
                    <OFACCheckFailedLayout info={contactOFAC} />
                )}
            </div>
        </div>
    );
});
