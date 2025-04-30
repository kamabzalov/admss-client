import { Button, ButtonProps } from "primereact/button";
import "./index.css";

export enum BUTTON_VARIANTS {
    NEW = "new",
    PRINT = "print",
    DOWNLOAD = "download",
}

interface ControlButtonProps extends ButtonProps {
    variant: BUTTON_VARIANTS;
}

export const ControlButton = ({ variant, ...props }: ControlButtonProps) => {
    const buttonIcon = {
        [BUTTON_VARIANTS.NEW]: "icon adms-add-item",
        [BUTTON_VARIANTS.PRINT]: "icon adms-print",
        [BUTTON_VARIANTS.DOWNLOAD]: "icon adms-download",
    };

    const buttonLabel = {
        [BUTTON_VARIANTS.NEW]: "New",
        [BUTTON_VARIANTS.PRINT]: "Print",
        [BUTTON_VARIANTS.DOWNLOAD]: "Download",
    };

    const buttonClassName = {
        [BUTTON_VARIANTS.NEW]: "new-item-button",
        [BUTTON_VARIANTS.PRINT]: "print-button",
        [BUTTON_VARIANTS.DOWNLOAD]: "download-button",
    };

    return (
        <Button
            className={`${buttonClassName[variant]} ${props.className}`}
            icon={props.icon || buttonIcon[variant]}
            severity={props.severity || "success"}
            type={props.type || "button"}
            {...props}
        >
            {props.label || (variant === BUTTON_VARIANTS.NEW && buttonLabel[variant])}
        </Button>
    );
};
