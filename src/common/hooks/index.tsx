import { setCursorToStart } from "common/helpers";
import { RefObject, useCallback, useEffect, useState } from "react";
import { ConfirmModal } from "dashboard/common/dialog/confirm";

export const useCursorToStart = (containerRef: RefObject<HTMLDivElement>) => {
    useEffect(() => {
        const realInput = containerRef.current?.querySelector("input");
        if (realInput) {
            realInput.addEventListener("focus", () => setCursorToStart(realInput));
        }
    }, [containerRef]);
};

interface DateRangeResult {
    startDate: string | number;
    endDate: string | number;
    isButtonDisabled: boolean;
    handleDateChange: (date: number, isStartDate: boolean) => void;
}

export const useDateRange = (): DateRangeResult => {
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string | number>("");
    const [endDate, setEndDate] = useState<string | number>("");

    useEffect(() => {
        if (!startDate || !endDate) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    }, [startDate, endDate]);

    const handleDateChange = (date: number, isStartDate: boolean) => {
        if (isStartDate) {
            setStartDate(date);
            if (!endDate || Number(endDate) < date) {
                setEndDate(date);
            }
        } else {
            setEndDate(date);
        }
    };

    return {
        startDate,
        endDate,
        isButtonDisabled,
        handleDateChange,
    };
};

interface UseFormExitConfirmationProps {
    isFormChanged: boolean;
    onConfirmExit: () => void;
    confirmTitle?: string;
    confirmMessage?: string;
    icon?: string;
    className?: string;
}

enum ModalMessage {
    TITLE = "Quit Editing?",
    MESSAGE = "Are you sure you want to leave this page? All unsaved data will be lost.",
    ICON = "adms-warning",
    CLASS_NAME = "quit-editing",
    ACCEPT_LABEL = "Confirm",
    REJECT_LABEL = "Cancel",
}

export const useFormExitConfirmation = ({
    isFormChanged,
    onConfirmExit,
    confirmTitle = ModalMessage.TITLE,
    confirmMessage = ModalMessage.MESSAGE,
    icon = ModalMessage.ICON,
    className,
}: UseFormExitConfirmationProps) => {
    const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);

    const handleExitClick = useCallback(() => {
        if (isFormChanged) {
            setIsConfirmVisible(true);
        } else {
            onConfirmExit();
        }
    }, [isFormChanged, onConfirmExit]);

    const handleConfirmExit = useCallback(() => {
        onConfirmExit();
        setIsConfirmVisible(false);
    }, [onConfirmExit]);

    const handleCancelExit = useCallback(() => {
        setIsConfirmVisible(false);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isFormChanged) {
                event.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isFormChanged]);

    const ConfirmModalComponent = () => (
        <ConfirmModal
            visible={isConfirmVisible}
            title={confirmTitle}
            icon={icon}
            bodyMessage={confirmMessage}
            confirmAction={handleConfirmExit}
            draggable={false}
            rejectLabel={ModalMessage.REJECT_LABEL}
            acceptLabel={ModalMessage.ACCEPT_LABEL}
            resizable={false}
            className={`${className ?? ""} ${ModalMessage.CLASS_NAME}`}
            onHide={handleCancelExit}
        />
    );

    return {
        handleExitClick,
        ConfirmModalComponent,
    };
};
