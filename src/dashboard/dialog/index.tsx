import { Dialog, DialogProps } from "primereact/dialog";
import { Button } from "primereact/button";

interface DashboardDialogProps extends DialogProps {
    action?: () => void;
}

export const DashboardDialog = ({
    visible,
    onHide,
    header,
    children,
    footer,
    className,
    action,
}: DashboardDialogProps) => {
    return (
        <Dialog header={header} className={`dialog ${className}`} visible={visible} onHide={onHide}>
            <div className='p-dialog-content-body'>{children}</div>

            <div className='p-dialog-footer flex justify-content-center'>
                <Button label={`${footer}`} className='bold' onClick={action} />
            </div>
        </Dialog>
    );
};
