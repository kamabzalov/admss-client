import { ReactElement } from "react";
import { Modal, Button } from "react-bootstrap";

interface ConfirmModalProps {
    show: boolean;
    message?: string;
    onConfirm: () => void;
    onCancel: () => void;
    itemName?: string | number;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    primaryButtonVariant?: "danger" | "success" | "primary";
}

export const ConfirmModal = ({
    show,
    onConfirm,
    onCancel,
    itemName,
    message,
    secondaryButtonText,
    primaryButtonText,
    primaryButtonVariant,
}: ConfirmModalProps): ReactElement => {
    return (
        <Modal show={show} onHide={onCancel} centered size='sm'>
            <Modal.Body>{message || `Are you sure you want to delete ${itemName}?`}</Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={onCancel}>
                    {secondaryButtonText || "Cancel"}
                </Button>
                <Button variant={primaryButtonVariant || "danger"} onClick={onConfirm}>
                    {primaryButtonText || "Delete"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
