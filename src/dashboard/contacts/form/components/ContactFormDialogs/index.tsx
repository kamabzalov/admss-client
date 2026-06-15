import { ReactElement } from "react";
import { ConfirmModal } from "dashboard/common/dialog/confirm";

interface ContactFormDialogsProps {
    isConfirmVisible: boolean;
    confirmTitle: string;
    confirmMessage: string;
    confirmAction: () => void;
    onHideConfirm: () => void;
    confirmActive: boolean;
    onHideDeleteConfirm: () => void;
    onConfirmDelete: () => void;
}

export default function ContactFormDialogs({
    isConfirmVisible,
    confirmTitle,
    confirmMessage,
    confirmAction,
    onHideConfirm,
    confirmActive,
    onHideDeleteConfirm,
    onConfirmDelete,
}: ContactFormDialogsProps): ReactElement {
    if (isConfirmVisible) {
        return (
            <ConfirmModal
                visible={!!isConfirmVisible}
                title={confirmTitle}
                icon='pi-exclamation-triangle'
                bodyMessage={confirmMessage}
                confirmAction={confirmAction}
                draggable={false}
                rejectLabel='Cancel'
                acceptLabel='Confirm'
                resizable={false}
                className='contact-confirm-dialog'
                onHide={onHideConfirm}
            />
        );
    }

    return (
        <ConfirmModal
            visible={confirmActive}
            draggable={false}
            position='top'
            className='contact-delete-dialog'
            bodyMessage='Do you really want to delete this contact? 
                This process cannot be undone.'
            rejectLabel='Cancel'
            acceptLabel='Delete'
            confirmAction={onConfirmDelete}
            onHide={onHideDeleteConfirm}
        />
    );
}
