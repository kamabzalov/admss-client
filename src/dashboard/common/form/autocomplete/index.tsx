import { AutoComplete, AutoCompleteProps } from "primereact/autocomplete";
import { Button } from "primereact/button";
import { FocusEvent, ReactElement, useState, useRef, useEffect } from "react";
import { FieldLabel } from "dashboard/common/form/field-label";
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
    value,
    onFocus,
    minLength,
    ...props
}: AutoCompleteDropdownProps): ReactElement => {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const autoCompleteRef = useRef<AutoComplete>(null);
    const [dropdownWidth, setDropdownWidth] = useState<number>(0);

    useEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            setDropdownWidth(width);
        }
    }, []);

    useEffect(() => {
        if (!value && autoCompleteRef.current) {
            autoCompleteRef.current.hide();
            setIsDropdownVisible(false);
        }
    }, [value]);

    const handleClear = () => {
        if (autoCompleteRef.current) {
            autoCompleteRef.current.hide();
            setIsDropdownVisible(false);
        }
        onClear?.();
    };

    const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
        onFocus?.(event);
        if (dropdown) {
            autoCompleteRef.current?.search(event, "", "dropdown");
        }
    };

    return (
        <div className='p-inputgroup autocomplete-dropdown' ref={containerRef}>
            <span className='p-float-label'>
                <AutoComplete
                    {...props}
                    value={value}
                    dropdown={dropdown}
                    minLength={minLength ?? (dropdown ? 0 : undefined)}
                    inputClassName='autocomplete-dropdown__input'
                    ref={autoCompleteRef}
                    onFocus={handleFocus}
                    onShow={() => setIsDropdownVisible(true)}
                    onHide={() => setIsDropdownVisible(false)}
                    onDropdownClick={() => {
                        if (isDropdownVisible && autoCompleteRef.current) {
                            autoCompleteRef.current.hide();
                            setIsDropdownVisible(false);
                        }
                    }}
                    pt={{
                        dropdownButton: {
                            root: {
                                style: {
                                    rotate: `${isDropdownVisible ? "180deg" : "0deg"}`,
                                    transition: "rotate 0.3s ease",
                                },
                            },
                        },

                        panel: {
                            style: {
                                width: `${dropdownWidth}px`,
                            },
                        },
                        list: {
                            style: {
                                width: `${dropdownWidth - 10}px`,
                            },
                        },
                        item: {
                            style: {
                                width: "100%",
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            },
                        },
                    }}
                />
                <FieldLabel text={label} />
            </span>
            {clearButton && !!value && (
                <Button
                    icon='pi pi-times'
                    type='button'
                    className='autocomplete-dropdown__clear-button'
                    onClick={handleClear}
                />
            )}
        </div>
    );
};
