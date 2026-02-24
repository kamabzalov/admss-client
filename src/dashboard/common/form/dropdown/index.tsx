import { forwardRef } from "react";
import { DEFAULT_FILTER_THRESHOLD } from "common/settings";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import "./index.css";
import { TruncatedText } from "dashboard/common/display";
import { useId } from "react";

interface CustomDropdownProps extends DropdownProps {
    filterThreshold?: number;
    label?: string;
    error?: boolean;
    errorMessage?: string;
}

export const ComboBox = forwardRef<Dropdown, CustomDropdownProps>(function ComboBox(
    {
        options,
        filter,
        filterThreshold = DEFAULT_FILTER_THRESHOLD,
        label,
        error,
        errorMessage,
        ...props
    },
    ref
) {
    const shouldEnableFilter = options && options.length > filterThreshold;
    const uniqueId = useId();
    const showError = error || !!errorMessage;

    const dropdownListItem = (option: unknown) => {
        const optionLabel = props?.optionLabel;
        let text = String(option);

        if (optionLabel && typeof option === "object" && option !== null) {
            text = String((option as Record<string, unknown>)[optionLabel] || "");
        }

        return <TruncatedText className='combo-box__list-item' withTooltip text={text} />;
    };

    const dropdown = (
        <Dropdown
            ref={ref}
            {...props}
            id={props.id || uniqueId}
            showClear={!props.required && props.value}
            className={`${props.className} combo-box ${showError ? "p-invalid" : ""}`}
            options={options}
            filter={filter ?? shouldEnableFilter}
            itemTemplate={dropdownListItem}
            pt={{
                list: {
                    className: "combo-box__list",
                },
            }}
        />
    );

    const content = label ? (
        <span className={`p-float-label ${showError ? "p-invalid" : ""}`}>
            {dropdown}
            <label htmlFor={uniqueId} className='float-label'>
                {label}
            </label>
            {showError && errorMessage && (
                <span className='input-error-wrapper relative'>
                    <div className='p-error'>
                        <small>{errorMessage}</small>
                    </div>
                </span>
            )}
        </span>
    ) : (
        <span className={`input-error-wrapper relative ${showError ? "p-invalid" : ""}`}>
            {dropdown}
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </span>
    );

    return content;
});
