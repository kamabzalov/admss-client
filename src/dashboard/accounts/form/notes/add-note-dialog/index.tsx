import { ACCOUNT_NOTE_CONTACT_TYPE } from "common/constants/account-options";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { DashboardDialog } from "dashboard/common/dialog";
import { TextInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import { addAccountNote } from "http/services/accounts.service";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useMemo, useState } from "react";

interface AddNoteDialogProps {
    visible: boolean;
    accountuid?: string;
    action: () => void;
    onHide: () => void;
}

export const AddNoteDialog = ({
    visible,
    onHide,
    action,
    accountuid,
}: AddNoteDialogProps): ReactElement => {
    const toast = useToast();
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [noteTaker, setNoteTaker] = useState<string>("");
    const [contactType, setContactType] = useState(ACCOUNT_NOTE_CONTACT_TYPE[0]);
    const [note, setNote] = useState<string>("");
    const currentTime = useMemo(
        () => `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        []
    );

    useEffect(() => {
        if (noteTaker && contactType && note) {
            setIsButtonDisabled(false);
        }
    }, [contactType, note, noteTaker]);

    const handleAddNote = () => {
        accountuid &&
            addAccountNote(accountuid, {
                NoteBy: noteTaker,
                Note: note,
                ContactMethod: contactType,
            }).then((res) => {
                if (res && res.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: res.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    toast.current?.show({
                        severity: "success",
                        summary: "Success",
                        detail: "Note added successfully",
                        life: TOAST_LIFETIME,
                    });

                    action();
                    onHide();
                }
            });
    };

    return (
        <DashboardDialog
            className='add-note'
            footer='Save'
            header='Add Note'
            cancelButton
            visible={visible}
            onHide={onHide}
            action={handleAddNote}
            buttonDisabled={isButtonDisabled}
        >
            <div className='grid gap-3'>
                <div className='add-note__info m-3'>
                    <strong>Date & Time: </strong>
                    <span className='add-note__time'>{currentTime}</span>
                </div>
                <TextInput
                    colWidth={12}
                    name='Note Taker'
                    value={noteTaker}
                    onChange={({ target: { value } }) => setNoteTaker(value)}
                />
                <div className='col-12'>
                    <span className='p-float-label'>
                        <Dropdown
                            options={ACCOUNT_NOTE_CONTACT_TYPE}
                            value={contactType}
                            onChange={(e) => setContactType(e.value)}
                            className='w-full'
                        />
                        <label className='float-label'>Contact Type</label>
                    </span>
                </div>
                <div className='col-12'>
                    <span className='p-float-label'>
                        <InputTextarea
                            className='w-full account-note__textarea'
                            value={note}
                            onChange={({ target: { value } }) => setNote(value)}
                        />
                        <label className='float-label'>Note</label>
                    </span>
                </div>
            </div>
        </DashboardDialog>
    );
};
