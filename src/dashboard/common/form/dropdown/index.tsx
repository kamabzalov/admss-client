import {
    CSSProperties,
    FocusEvent,
    forwardRef,
    useCallback,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";
import { DEFAULT_FILTER_THRESHOLD } from "common/settings";
import { Dropdown, DropdownChangeEvent, DropdownProps } from "primereact/dropdown";
import "./index.css";
import { TruncatedText } from "dashboard/common/display";
import { FieldLabel } from "dashboard/common/form/field-label";
import { useId } from "react";

interface CustomDropdownProps extends DropdownProps {
    filterThreshold?: number;
    label?: string;
    error?: boolean;
    errorMessage?: string;
    height?: number | string;
    openOnFocus?: boolean;
}

interface DropdownRef extends Dropdown {
    show: () => void;
    hide: () => void;
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
        editable,
        openOnFocus = editable,
        onFocus,
        onBlur,
        onHide,
        onChange,
        value,
        ...props
    },
    ref
) {
    const dropdownRef = useRef<DropdownRef>(null);
    const showDropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const suppressOpenOnFocusRef = useRef(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const shouldEnableFilter = options && options.length > filterThreshold;
    const uniqueId = useId();
    const showError = error || !!errorMessage;
    const resolvedHeight = typeof height === "number" ? `${height}px` : height;
    const heightStyle: CSSProperties | undefined = resolvedHeight
        ? ({ height: resolvedHeight, "--combo-box-height": resolvedHeight } as CSSProperties)
        : undefined;

    useImperativeHandle(ref, () => dropdownRef.current as Dropdown);

    const getOptionText = useCallback(
        (option: unknown): string => {
            if (option === null || typeof option === "undefined") {
                return "";
            }

            const optionLabel = props?.optionLabel;
            if (optionLabel && typeof option === "object" && option !== null) {
                return String((option as Record<string, unknown>)[optionLabel] || "");
            }

            return String(option);
        },
        [props.optionLabel]
    );

    const sortedOptions = useMemo(() => {
        if (!editable || !openOnFocus || !options?.length) {
            return options;
        }

        return [...options].sort((left, right) =>
            getOptionText(left).localeCompare(getOptionText(right))
        );
    }, [editable, getOptionText, openOnFocus, options]);

    const displayOptions = useMemo(() => {
        if (!editable || !openOnFocus || !isFiltering || value == null || value === "") {
            return sortedOptions;
        }

        const query = String(value).trim().toLowerCase();
        if (!query) {
            return sortedOptions;
        }

        return sortedOptions?.filter((option) =>
            getOptionText(option).toLowerCase().includes(query)
        );
    }, [editable, getOptionText, isFiltering, openOnFocus, sortedOptions, value]);

    const showDropdown = useCallback(() => {
        if (showDropdownTimeoutRef.current) {
            clearTimeout(showDropdownTimeoutRef.current);
        }

        showDropdownTimeoutRef.current = setTimeout(() => {
            dropdownRef.current?.show();
            showDropdownTimeoutRef.current = null;
        }, 0);
    }, []);

    const cancelShowDropdown = useCallback(() => {
        if (showDropdownTimeoutRef.current) {
            clearTimeout(showDropdownTimeoutRef.current);
            showDropdownTimeoutRef.current = null;
        }
    }, []);

    const suppressDropdownOpen = useCallback(() => {
        suppressOpenOnFocusRef.current = true;
        cancelShowDropdown();
    }, [cancelShowDropdown]);

    const handleFocus = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFiltering(false);
            onFocus?.(event);
            const shouldSuppressOpen = suppressOpenOnFocusRef.current;
            suppressOpenOnFocusRef.current = false;

            if (shouldSuppressOpen) {
                cancelShowDropdown();
                return;
            }

            if (editable && openOnFocus) {
                showDropdown();
            }
        },
        [cancelShowDropdown, editable, onFocus, openOnFocus, showDropdown]
    );

    const handleHide = useCallback(() => {
        suppressDropdownOpen();
        onHide?.();
    }, [onHide, suppressDropdownOpen]);

    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
            setIsFiltering(false);
            onBlur?.(event);
        },
        [onBlur]
    );

    const handleChange = useCallback(
        (event: DropdownChangeEvent) => {
            if (editable && openOnFocus) {
                if (event.originalEvent?.type === "input") {
                    setIsFiltering(true);
                    showDropdown();
                } else {
                    setIsFiltering(false);
                    suppressDropdownOpen();
                }
            }
            onChange?.(event);
        },
        [editable, onChange, openOnFocus, showDropdown, suppressDropdownOpen]
    );

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
            ref={dropdownRef}
            {...props}
            id={props.id || uniqueId}
            editable={editable}
            value={value}
            showClear={!props.required && value}
            className={`${props.className} combo-box ${resolvedHeight ? "combo-box--custom-height" : ""} ${showError ? "p-invalid" : ""}`}
            style={{
                ...props.style,
                ...heightStyle,
            }}
            options={displayOptions}
            filter={editable && openOnFocus ? false : (filter ?? shouldEnableFilter)}
            itemTemplate={dropdownListItem}
            valueTemplate={dropdownListItem}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onHide={handleHide}
            onChange={handleChange}
            pt={{
                list: {
                    className: "combo-box__list",
                    onMouseDown: suppressDropdownOpen,
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
            <FieldLabel text={label} htmlFor={uniqueId} />
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
