import { ReactElement, ReactNode } from "react";
import { Button, ButtonProps } from "primereact/button";

interface EntityFormDeleteNavButtonProps extends Omit<ButtonProps, "children"> {
    children: ReactNode;
}

export const EntityFormDeleteNavButton = ({
    children,
    className = "",
    ...rest
}: EntityFormDeleteNavButtonProps): ReactElement => {
    return (
        <Button
            icon='pi pi-times'
            className={`p-button gap-2 entity-form-delete-nav w-full ${className}`.trim()}
            {...rest}
        >
            {children}
        </Button>
    );
};

interface EntityFormPrintNavButtonProps extends Omit<ButtonProps, "children"> {
    children: ReactNode;
    isActive?: boolean;
}

export const EntityFormPrintNavButton = ({
    children,
    isActive = false,
    className = "",
    ...rest
}: EntityFormPrintNavButtonProps): ReactElement => {
    return (
        <Button
            icon='icon adms-print'
            className={`p-button gap-2 entity-form-print-nav w-full ${
                isActive ? "entity-form-print-nav--active" : ""
            } ${className}`.trim()}
            {...rest}
        >
            {children}
        </Button>
    );
};
