import { DEFAULT_FILTER_THRESHOLD } from "common/settings";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import "./index.css";
import { TruncatedText } from "dashboard/common/display";
import { useId } from "react";

interface CustomDropdownProps extends DropdownProps {
    filterThreshold?: number;
    label?: string;
}

export const ComboBox = ({
    options,
    filter,
    filterThreshold = DEFAULT_FILTER_THRESHOLD,
    label,
    ...props
}: CustomDropdownProps) => {
    const shouldEnableFilter = options && options.length > filterThreshold;
    const uniqueId = useId();

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
            {...props}
            id={props.id || uniqueId}
            showClear={!props.required && props.value}
            className={`${props.className} combo-box`}
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

    return label ? (
        <span className='p-float-label'>
            {dropdown}
            <label htmlFor={uniqueId} className='float-label'>
                {label}
            </label>
        </span>
    ) : (
        dropdown
    );
};
