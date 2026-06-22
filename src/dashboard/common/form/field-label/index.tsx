import { ReactElement, ReactNode } from "react";
import "./index.css";

const REQUIRED_SUFFIX_REGEX = /\s*\(required\)\s*$/i;

export const splitFieldLabel = (text: string): { label: string; isRequired: boolean } => {
    if (REQUIRED_SUFFIX_REGEX.test(text)) {
        return {
            label: text.replace(REQUIRED_SUFFIX_REGEX, ""),
            isRequired: true,
        };
    }

    return { label: text, isRequired: false };
};

interface FieldLabelProps {
    text: string;
    htmlFor?: string;
    className?: string;
    children?: ReactNode;
}

export const FieldLabel = ({
    text,
    htmlFor,
    className = "float-label",
}: FieldLabelProps): ReactElement => {
    const { label, isRequired } = splitFieldLabel(text);

    return (
        <label htmlFor={htmlFor} className={className}>
            {label}
            {isRequired && <span className='field-label__required'> (required)</span>}
        </label>
    );
};
