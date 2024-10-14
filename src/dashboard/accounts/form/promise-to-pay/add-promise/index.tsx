import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import { TextInput } from "dashboard/common/form/inputs";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { useStore } from "store/hooks";

interface AddPromiseDialogProps extends DashboardDialogProps {
    visible: boolean;
    accountuid?: string;
    action: () => void;
    onHide: () => void;
}

export const AddPromiseDialog = ({
    visible,
    onHide,
    action,
    accountuid,
    ...props
}: AddPromiseDialogProps): ReactElement => {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [noteTaker, setNoteTaker] = useState<string>(authUser?.loginname || "");
    const [note, setNote] = useState<string>("");
    const currentTime = useMemo(
        () => `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        []
    );

    useEffect(() => {
        if (noteTaker && note) {
            setIsButtonDisabled(false);
        }
    }, [note, noteTaker]);

    return (
        <DashboardDialog
            className='add-note'
            footer='Save'
            header='Add Promise'
            cancelButton
            visible={visible}
            onHide={onHide}
            action={() => onHide()}
            buttonDisabled={isButtonDisabled}
            {...props}
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
