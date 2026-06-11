import { ReactElement } from "react";
import { DashboardDialog } from "dashboard/common/dialog";

export enum ValidationErrorType {
    MISSING,
    INVALID,
}

enum DialogErrorMessages {
    MISSING_TITLE = "Required data is missing",
    INVALID_TITLE = "Invalid data format",
    MISSING_MESSAGE = "The form cannot be saved as it missing required data.",
    INVALID_MESSAGE = "The form cannot be saved because some fields have an invalid format.",
    MISSING_BUTTON = "Please fill in the required fields and try again.",
    INVALID_BUTTON = "Please correct the invalid fields and try again.",
}

const DialogBody = ({ type }: { type: ValidationErrorType }): ReactElement => {
    return (
        <>
            <div className='confirm-header'>
                <i className='pi pi-exclamation-triangle confirm-header__icon' />
                <div className='confirm-header__title'>
                    {type === ValidationErrorType.MISSING
                        ? DialogErrorMessages.MISSING_TITLE
                        : DialogErrorMessages.INVALID_TITLE}
                </div>
            </div>
            <div className='text-center w-full confirm-body'>
                {type === ValidationErrorType.MISSING
                    ? DialogErrorMessages.MISSING_MESSAGE
                    : DialogErrorMessages.INVALID_MESSAGE}
            </div>
            <div className='text-center w-full confirm-body--bold'>
                {type === ValidationErrorType.MISSING
                    ? DialogErrorMessages.MISSING_BUTTON
                    : DialogErrorMessages.INVALID_BUTTON}
            </div>
        </>
    );
};

interface ContactValidationDialogProps {
    visible: boolean;
    errorType: ValidationErrorType;
    onHide: () => void;
}

export default function ContactValidationDialog({
    visible,
    errorType,
    onHide,
}: ContactValidationDialogProps): ReactElement {
    return (
        <DashboardDialog
            visible={visible}
            className='contact-missed-data-dialog'
            onHide={onHide}
            footer='Got it'
            action={onHide}
        >
            <DialogBody type={errorType} />
        </DashboardDialog>
    );
}
