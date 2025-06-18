import { useRef, ReactNode } from "react";
import { ConfirmDialog, ConfirmDialogProps } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import "./index.css";

interface ConfirmModalProps extends ConfirmDialogProps {
    bodyMessage?: string | ReactNode;
    title?: string;
    icon?: string;
    confirmAction?: () => void;
    rejectAction?: () => void;
    visible: boolean;
    onHide: () => void;
    showCheckbox?: boolean;
    checkboxLabel?: string;
    checkboxChecked?: boolean;
    onCheckboxChange?: (checked: boolean) => void;
}

export const ConfirmModal = ({
    bodyMessage,
    confirmAction,
    rejectAction,
    title,
    visible,
    onHide,
    icon,
    showCheckbox = false,
    checkboxLabel = "Remember this choice",
    checkboxChecked = false,
    onCheckboxChange,
    ...props
}: ConfirmModalProps) => {
    const toast = useRef<Toast>(null);

    const accept = () => {
        confirmAction?.();
        onHide();
    };

    const reject = () => {
        rejectAction?.();
        onHide();
    };

    return (
        <>
            <ConfirmDialog
                header={
                    <div className='confirm-header'>
                        <i
                            className={`pi ${icon ? icon : "pi-times-circle"} confirm-header__icon`}
                        />
                        <div className='confirm-header__title'>{title || "Are you sure?"}</div>
                    </div>
                }
                message={
                    <div className='text-center w-full confirm-body'>
                        {bodyMessage || "Please confirm to proceed moving forward."}
                        {showCheckbox && (
                            <div className='confirm-checkbox'>
                                <Checkbox
                                    checked={checkboxChecked}
                                    onChange={(e) => onCheckboxChange?.(e.checked || false)}
                                    inputId='confirmCheckbox'
                                />
                                <label htmlFor='confirmCheckbox' className='ml-2'>
                                    {checkboxLabel}
                                </label>
                            </div>
                        )}
                    </div>
                }
                visible={visible}
                onHide={onHide}
                accept={accept}
                reject={reject}
                focusOnShow
                draggable={false}
                {...props}
            />
            <Toast ref={toast} />
        </>
    );
};
