import { Dialog, DialogProps } from "primereact/dialog";
import { Button } from "primereact/button";

export interface DashboardDialogProps extends DialogProps {
    action?: () => void;
    buttonDisabled?: boolean;
}

export const DashboardDialog = ({
    visible,
    onHide,
    header,
    children,
    footer,
    className,
    action,
    buttonDisabled,
}: DashboardDialogProps) => {
    return (
        <Dialog
            draggable={false}
            header={header}
            className={`dialog ${className}`}
            visible={visible}
            onHide={onHide}
        >
            <div className='p-dialog-content-body'>{children}</div>

            <div className='p-dialog-footer flex justify-content-center'>
                {footer && (
                    <Button label={`${footer}`} disabled={buttonDisabled} onClick={action} />
                )}
            </div>
        </Dialog>
    );
};
