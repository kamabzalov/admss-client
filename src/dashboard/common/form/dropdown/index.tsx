import { DEFAULT_FILTER_THRESHOLD } from "common/settings";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import "./index.css";
import { TruncatedText } from "dashboard/common/display";

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

    const dropdownListItem = (option: unknown) => {
        const optionLabel = props?.optionLabel;
        const text =
            optionLabel && typeof option === "object" && option !== null
                ? (option as Record<string, unknown>)[optionLabel]
                : "";

        return <TruncatedText className='combo-box__list-item' withTooltip text={String(text)} />;
    };

    const dropdown = (
        <Dropdown
            {...props}
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
            <label className='float-label'>{label}</label>
        </span>
    ) : (
        dropdown
    );
};
