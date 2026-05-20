import { CSSProperties, forwardRef } from "react";
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
    height?: number | string;
}

export const ComboBox = forwardRef<Dropdown, CustomDropdownProps>(function ComboBox(
    {
        options,
        filter,
        filterThreshold = DEFAULT_FILTER_THRESHOLD,
        label,
        error,
        errorMessage,
        height,
        ...props
    },
    ref
) {
    const shouldEnableFilter = options && options.length > filterThreshold;
    const uniqueId = useId();
    const showError = error || !!errorMessage;
    const resolvedHeight = typeof height === "number" ? `${height}px` : height;
    const heightStyle: CSSProperties | undefined = resolvedHeight
        ? ({ height: resolvedHeight, "--combo-box-height": resolvedHeight } as CSSProperties)
        : undefined;

    const dropdownListItem = (option: unknown) => {
        if (option === null || typeof option === "undefined") {
            return <span className='combo-box__list-item'>{props.placeholder || ""}</span>;
        }

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
            className={`${props.className} combo-box ${resolvedHeight ? "combo-box--custom-height" : ""} ${showError ? "p-invalid" : ""}`}
            style={{
                ...props.style,
                ...heightStyle,
            }}
            options={options}
            filter={filter ?? shouldEnableFilter}
            itemTemplate={dropdownListItem}
            valueTemplate={dropdownListItem}
            pt={{
                list: {
                    className: "combo-box__list",
                },
            }}
        />
    );

    const content = label ? (
        <span
            className={`p-float-label ${resolvedHeight ? "combo-box-float-label--custom-height" : ""} ${showError ? "p-invalid" : ""}`}
            style={heightStyle}
        >
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
