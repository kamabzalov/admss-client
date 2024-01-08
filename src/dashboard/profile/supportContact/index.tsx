import { DashboardDialog } from "dashboard/common/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import { DialogProps } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import "./index.css";
import { createOrUpdateSupportMessage } from "http/services/support.service";

const SUPPORT_CONTACT_TOPICS: ReadonlyArray<string> = [
    "Question",
    "Problem",
    "Feature request",
    "General",
];

export const SupportContactDialog = ({ visible, onHide }: DialogProps): JSX.Element => {
    const [email, setEmail] = useState<string>("");
    const [topic, setTopic] = useState<string>("");
    const [description, setDescription] = useState<string>("");

    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    useEffect(() => {
        const isEveryFieldFilled = email.trim() && topic.trim() && description.trim();
        setIsButtonDisabled(!isEveryFieldFilled);
    }, [email, topic, description]);

    const handleSendSupportContact = (): void => {
        createOrUpdateSupportMessage({ email: email, topic: topic, message: description })
            .then((response) => {
                // TODO: Show success message
            })
            .catch((error) => {
                // TODO: Show error message
            });
        onHide();
        return;
    };

    return (
        <DashboardDialog
            className='dialog__contact-support contact-support'
            footer='Send'
            header='Contact support'
            visible={visible}
            onHide={onHide}
            action={handleSendSupportContact}
            buttonDisabled={isButtonDisabled}
        >
            <InputText
                placeholder='E-mail'
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <Dropdown
                placeholder='Choose your topic'
                value={topic}
                options={[...SUPPORT_CONTACT_TOPICS]}
                className='flex align-items-center'
                onChange={(event) => setTopic(event.target.value)}
            />
            <InputTextarea
                placeholder='Describe your problem...'
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className='contact-support__description'
            />
        </DashboardDialog>
    );
};
