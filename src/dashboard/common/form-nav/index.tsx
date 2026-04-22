import { ReactElement, ReactNode } from "react";
import { Button, ButtonProps } from "primereact/button";

interface FormNavProps {
    children: ReactNode;
    className?: string;
}

export const FormNav = ({ children, className = "" }: FormNavProps): ReactElement => {
    return (
        <div className={`flex justify-content-end gap-3 mt-5 mr-3 form-nav ${className}`.trim()}>
            {children}
        </div>
    );
};

export const FormNavButton = ({
    className,
    type = "button",
    ...rest
}: ButtonProps): ReactElement => {
    return (
        <Button type={type} {...rest} className={`form-nav__button ${className || ""}`.trim()} />
    );
};
