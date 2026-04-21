import { ReactElement } from "react";
import { CONVERT_DISABLED_HINT } from "../../types";

interface ConvertButtonProps {
    label: string;
    disabled: boolean;
    onClick?: () => void;
    disabledHint?: string;
}

export const ConvertButton = ({
    label,
    disabled,
    onClick,
    disabledHint = CONVERT_DISABLED_HINT,
}: ConvertButtonProps): ReactElement => {
    return (
        <span
            className='lead-form__convert-wrap'
            data-pr-tooltip={disabled ? disabledHint : undefined}
            data-pr-position='top'
        >
            <button
                type='button'
                className='lead-form__convert-button'
                disabled={disabled}
                onClick={onClick}
            >
                {label}
            </button>
        </span>
    );
};
