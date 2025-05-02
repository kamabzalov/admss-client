import { AutoComplete, AutoCompleteProps } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { ReactElement, useState } from "react";
import "./index.css";

interface AutoCompleteDropdownProps extends AutoCompleteProps {
    label: string;
    clearButton?: boolean;
    onClear?: () => void;
}

export const AutoCompleteDropdown = ({
    label,
    onClear,
    clearButton = false,
    dropdown = true,
    ...props
}: AutoCompleteDropdownProps): ReactElement => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    return (
        <div className='p-inputgroup autocomplete-dropdown'>
            <span className='p-float-label'>
                <AutoComplete
                    {...props}
                    dropdown={dropdown}
                    inputClassName='autocomplete-dropdown__input'
                    onShow={() => setIsDropdownVisible(true)}
                    onHide={() => setIsDropdownVisible(false)}
                    pt={{
                        dropdownButton: {
                            root: {
                                style: {
                                    rotate: `${isDropdownVisible ? "180deg" : "0deg"}`,
                                    transition: "rotate 0.3s ease",
                                },
                            },
                        },
                    }}
                />
                <label className='float-label'>{label}</label>
            </span>
            {clearButton && !!props.value && (
                <Button
                    icon='pi pi-times'
                    type='button'
                    className='autocomplete-dropdown__clear-button'
                    onClick={onClear}
                />
            )}
        </div>
    );
};
