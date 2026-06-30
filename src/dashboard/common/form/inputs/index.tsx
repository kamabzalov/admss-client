import { CSSProperties, LegacyRef, ReactElement, useEffect, useId, useRef, useState } from "react";
import { debounce } from "common/helpers";
import { RadioButton, RadioButtonChangeEvent, RadioButtonProps } from "primereact/radiobutton";
import "./index.css";
import { InputNumber, InputNumberProps, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent, CheckboxProps } from "primereact/checkbox";
import { Calendar, CalendarProps } from "primereact/calendar";
import { DropdownProps } from "primereact/dropdown";
import { InputText, InputTextProps } from "primereact/inputtext";
import { STATES_LIST } from "common/constants/states";
import { Button } from "primereact/button";
import { InputMask, InputMaskChangeEvent, InputMaskProps } from "primereact/inputmask";
import { ComboBox } from "dashboard/common/form/dropdown";
import { DEFAULT_FILTER_THRESHOLD } from "common/settings";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { EMAIL_REGEX } from "common/constants/regex";
import { TruncatedText } from "dashboard/common/display";
import { FieldLabel } from "dashboard/common/form/field-label";

type LabelPosition = "left" | "right" | "top";

export enum CURRENCY_OPTIONS {
    DOLLAR = "$",
    PERCENT = "%",
}

export const CURRENCY_SELECT_OPTIONS = [
    { label: CURRENCY_OPTIONS.DOLLAR, value: 0, name: "dollar" },
    { label: CURRENCY_OPTIONS.PERCENT, value: 1, name: "percent" },
];

interface DashboardRadioProps {
    radioArray: RadioButtonProps[];
    style?: CSSProperties;
    disabled?: boolean;
    initialValue?: string | number | null;
    clearable?: boolean;
    onChange?: (value: string | number | null) => void;
    wrapperClassName?: string;
    justifyContent?: "between" | "center" | "start" | "end";
    rowGap?: number;
    columnGap?: 2 | 3 | 4;
    children?: React.ReactNode;
}

interface CurrencyInputProps extends InputNumberProps {
    currencyIcon?: CURRENCY_OPTIONS;
    labelPosition?: LabelPosition;
    coloredEmptyValue?: boolean;
    wrapperClassName?: string;
    error?: boolean;
    errorMessage?: string;
}

interface PercentInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
    floatLabel?: boolean;
    emptyValue?: boolean;
    error?: boolean;
    errorMessage?: string;
}

type Push<N extends number, T extends any[]> = ((...args: T) => void) extends (
    head: any,
    ...tail: infer R
) => void
    ? [...R, any]["length"] extends N
        ? T
        : Push<N, [...T, any]>
    : never;

type Range<
    Start extends number,
    End extends number,
    T extends any[] = Push<Start, []>,
> = T["length"] extends End ? never : T["length"] | Range<Start, End, [any, ...T]>;

interface DateInputProps extends Omit<CalendarProps, "value" | "onChange"> {
    date?: number | Date | string;
    value?: CalendarProps["value"] | string | number;
    colWidth?: Range<1, 13>;
    checkbox?: boolean;
    checked?: boolean;
    onCheckboxChange?: (e: CheckboxChangeEvent) => void;
    checkboxWithLabel?: boolean;
    emptyDate?: boolean;
    clearButton?: boolean;
    floatLabel?: boolean;
    hideTodayHighlight?: boolean;
    onClearAction?: () => void;
    error?: boolean;
    errorMessage?: string;
    onChange?: (e: { value: Date | null | undefined; target: { value: string } }) => void;
}

interface TextInputProps extends InputTextProps {
    colWidth?: Range<1, 13>;
    clearButton?: boolean;
    ref?: React.RefObject<HTMLInputElement | null>;
    wrapperClassName?: string;
    infoText?: string;
    error?: boolean;
    errorMessage?: string | null;
    label?: string;
}

interface NumberInputProps extends InputNumberProps {
    colWidth?: Range<1, 13>;
    ref?: React.RefObject<InputNumber | null>;
    wrapperClassName?: string;
    infoText?: string;
    error?: boolean;
    errorMessage?: string;
    label?: string;
}

interface PhoneInputProps extends Omit<InputMaskProps, "onChange" | "onBlur"> {
    colWidth?: Range<1, 13>;
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
    withValidationMessage?: boolean;
    error?: boolean;
    errorMessage?: string;
}

interface EmailInputProps extends Omit<InputTextProps, "onChange" | "onBlur"> {
    colWidth?: Range<1, 13>;
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
    withValidationMessage?: boolean;
    error?: boolean;
    errorMessage?: string;
}

interface StateDropdownProps extends DropdownProps {
    colWidth?: Range<1, 13>;
}

export const DashboardRadio = ({
    radioArray,
    initialValue,
    clearable,
    style,
    disabled,
    wrapperClassName,
    onChange,
    children,
    rowGap = 3,
    justifyContent = "between",
    columnGap = 3,
}: DashboardRadioProps): ReactElement => {
    const [radioValue, setRadioValue] = useState<string>("");

    const handleRadioChange = (e: RadioButtonChangeEvent) => {
        const clicked = String(e.value);
        if (clearable && radioValue === clicked) {
            setRadioValue("");
            onChange?.(null);
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
            }
            return;
        }
        setRadioValue(clicked);
        onChange?.(clicked);
    };

    useEffect(() => {
        if (initialValue !== undefined && initialValue !== null) {
            setRadioValue(String(initialValue));
        } else {
            setRadioValue("");
        }
    }, [initialValue]);

    return (
        <section
            className={`flex flex-wrap row-gap-${rowGap} justify-content-${justifyContent} ${columnGap ? `column-gap-${columnGap}` : ""} radio ${wrapperClassName || ""}`}
        >
            {radioArray.map(({ name, title, value }) => {
                const strValue = String(value);
                const isChecked = radioValue === strValue;
                return (
                    <div
                        key={name}
                        className='flex align-items-center justify-content-between radio__item radio-item border-round'
                        style={style}
                        onClick={() =>
                            clearable &&
                            isChecked &&
                            !disabled &&
                            handleRadioChange({
                                value: strValue,
                            } as RadioButtonChangeEvent)
                        }
                    >
                        <div className='radio-item__input flex align-items-center justify-content-center'>
                            <RadioButton
                                inputId={name}
                                name={name}
                                disabled={disabled}
                                value={strValue}
                                onChange={handleRadioChange}
                                checked={isChecked}
                            />
                        </div>
                        <label htmlFor={name} className='radio-item__label'>
                            {title}
                        </label>
                    </div>
                );
            })}
            {children}
        </section>
    );
};

export const CurrencyInput = ({
    name,
    value,
    title,
    labelPosition = "left",
    currencyIcon = CURRENCY_OPTIONS.DOLLAR,
    coloredEmptyValue = false,
    wrapperClassName,
    error = false,
    errorMessage,
    ...props
}: CurrencyInputProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<InputNumber>(null);
    const uniqueId = useId();
    const shouldClearOnInput = useRef(false);
    const showError = error || !!errorMessage;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const input = inputRef.current?.getInput() as HTMLInputElement | undefined;
        if (input) {
            requestAnimationFrame(() => {
                input.setSelectionRange(0, 0);
            });
        }
        if (!value || value === 0) {
            shouldClearOnInput.current = true;
        }
        if (props.onFocus) {
            props.onFocus(e);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (shouldClearOnInput?.current && !!e?.key?.length) {
            shouldClearOnInput.current = false;
            const input = inputRef.current?.getInput() as HTMLInputElement | undefined;
            if (input) {
                input.select();
            }
        }
        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        shouldClearOnInput.current = false;
        if (!value && value !== 0) {
            if (props.onValueChange) {
                props.onValueChange({
                    value: 0,
                } as InputNumberValueChangeEvent);
            }
        }
        if (props.onBlur) {
            props.onBlur(e);
        }
    };

    return (
        <div
            key={name}
            className={`flex align-items-center justify-content-between currency-item relative text-input ${showError ? "p-invalid" : ""} ${wrapperClassName || ""}`}
            ref={containerRef}
        >
            <FieldLabel
                text={title || ""}
                htmlFor={uniqueId}
                className={`currency-item__label ${labelPosition === "top" && "label-top"}`}
            />
            <div className='currency-item__input flex justify-content-center'>
                {currencyIcon === CURRENCY_OPTIONS.DOLLAR && (
                    <div className='currency-item__icon input-icon input-icon-left'>
                        <i className='icon adms-dollar-sign' />
                    </div>
                )}
                {currencyIcon === CURRENCY_OPTIONS.PERCENT && (
                    <div className='currency-item__icon input-icon input-icon-left currency-item__icon--percent'>
                        <i className='icon adms-percentage' />
                    </div>
                )}
                <InputNumber
                    ref={inputRef}
                    inputId={uniqueId}
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    min={0}
                    locale='en-US'
                    value={value === null ? null : value || 0}
                    inputClassName={`${coloredEmptyValue && !value ? "currency-item__input--empty" : ""} ${showError ? "p-invalid" : ""}`}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    {...props}
                />
            </div>
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </div>
    );
};

export const PercentInput = ({
    name,
    title,
    labelPosition = "left",
    emptyValue = false,
    floatLabel = false,
    error = false,
    errorMessage,
    ...props
}: PercentInputProps): ReactElement => {
    const uniqueId = useId();
    const showError = error || !!errorMessage;
    return (
        <div
            key={name}
            className={`flex align-items-center justify-content-between percent-item relative text-input ${showError ? "p-invalid" : ""}`}
        >
            <FieldLabel
                text={title || ""}
                htmlFor={uniqueId}
                className={`percent-item__label ${!props.value && floatLabel ? "percent-item__label--empty" : ""} ${labelPosition === "top" && "label-top"}`}
            />
            <div className='percent-item__input flex justify-content-center'>
                <InputNumber
                    min={0}
                    minFractionDigits={2}
                    inputId={uniqueId}
                    name={name}
                    inputClassName={`${props.value ? "percent-item__input--filled" : "percent-item__input--empty"} ${showError ? "p-invalid" : ""}`}
                    {...props}
                    value={props.value ? props.value : 0}
                    pt={{
                        root: {
                            id: name,
                        },
                    }}
                />
                <div className='percent-item__icon input-icon input-icon-right'>%</div>
            </div>
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </div>
    );
};

export const BorderedCheckbox = ({
    name,
    height = "50px",
    inputId,
    className,
    disabled,
    ...props
}: CheckboxProps): ReactElement => {
    const checkboxId = inputId || name;

    return (
        <label
            htmlFor={checkboxId}
            style={{
                height,
            }}
            className={`p-inputgroup flex-1 w-full align-items-center justify-content-between bordered-checkbox cursor-pointer ${disabled ? "p-disabled" : ""} ${className || ""}`}
        >
            <span className='bordered-checkbox__text'>{name}</span>
            <span className='p-inputgroup-addon'>
                <Checkbox inputId={checkboxId} disabled={disabled} {...props} />
            </span>
        </label>
    );
};

interface SearchInputProps extends DropdownProps {
    onInputChange?: (value: string) => void;
    onIconClick?: () => void;
    error?: boolean;
    errorMessage?: string;
}

export const SearchInput = ({
    height = "50px",
    title,
    onInputChange,
    onIconClick,
    error,
    errorMessage,
    disabled,
    ...props
}: SearchInputProps): ReactElement => {
    const dropdownRef: LegacyRef<any> = useRef(null);
    const showError = error || !!errorMessage;

    const handleOnInputChange = ({ target }: any) => {
        const { value } = target as DropdownProps;
        if (onInputChange && value) {
            dropdownRef.current.show();
            onInputChange(value);
        } else {
            dropdownRef.current.hide();
        }
    };

    return (
        <span
            className={`input-error-wrapper relative ${showError ? "p-invalid" : ""}`}
            style={{ display: "block" }}
        >
            <div
                key={props.name}
                style={{
                    height,
                }}
                className='flex align-items-center search-input'
            >
                <span className='p-float-label search-input__wrapper'>
                    <ComboBox
                        ref={dropdownRef}
                        filter={props.options && props.options?.length > DEFAULT_FILTER_THRESHOLD}
                        autoFocus={false}
                        onInput={handleOnInputChange}
                        optionLabel='name'
                        editable
                        placeholder={title}
                        {...props}
                        disabled={disabled}
                        pt={{
                            trigger: {
                                className: "hidden",
                            },
                        }}
                    />
                    <FieldLabel text={title || ""} className='float-label search-input__label' />
                </span>
                <button
                    className='search-input__icon input-icon input-icon-right'
                    onClick={onIconClick}
                    type='button'
                    disabled={disabled}
                >
                    <i className='icon adms-table-search' />
                </button>
            </div>
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </span>
    );
};

export const DateInput = ({
    date,
    name,
    value,
    checkbox,
    onCheckboxChange,
    checkboxWithLabel,
    colWidth,
    emptyDate,
    clearButton,
    floatLabel = true,
    checked = false,
    hideTodayHighlight,
    onClearAction,
    onChange,
    error,
    errorMessage,
    ...props
}: DateInputProps): ReactElement => {
    const { panelClassName, ...calendarProps } = props;
    const mergedPanelClassName = [panelClassName, hideTodayHighlight && "p-datepicker--hide-today"]
        .filter(Boolean)
        .join(" ");
    const showError = error || !!errorMessage;
    const [innerDate, setInnerDate] = useState<Date | null>(null);
    const [isChecked, setIsChecked] = useState<boolean>(checked);
    const uniqueId = useId();
    const calendarRef = useRef<Calendar>(null);

    useEffect(() => {
        if (date !== undefined && date !== null && !isNaN(Number(date)) && Number(date) !== 0) {
            setInnerDate(new Date(Number(date)));
        } else if (
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !isNaN(Number(value)) &&
            Number(value) !== 0
        ) {
            setInnerDate(new Date(Number(value)));
        } else if (!emptyDate && !checkbox) {
            setInnerDate(new Date());
        } else {
            setInnerDate(null);
        }
    }, [date, value, emptyDate]);

    const handleDateChange = (selected: Date | null) => {
        setInnerDate(selected);
    };

    const handleClearDate = () => {
        setInnerDate(null);
        onClearAction?.();
    };

    const openCalendar = () => {
        if (calendarRef.current) {
            calendarRef.current.show();
        }
    };

    const content = (
        <span
            className={`date-input__wrapper relative ${showError ? "p-invalid" : ""}`}
            style={{ display: "block" }}
        >
            <div
                key={name}
                className={`flex align-items-center justify-content-between date-item relative ${
                    innerDate ? "date-item--filled" : "date-item--empty"
                }`}
            >
                {((!checkbox && floatLabel) ||
                    (checkbox && !isChecked && floatLabel) ||
                    (checkbox && checkboxWithLabel && isChecked)) && (
                    <FieldLabel
                        text={name || ""}
                        htmlFor={uniqueId}
                        className={`date-item__label ${innerDate ? "" : "date-item__label--empty"} label-top ${checkbox && !isChecked ? "ml-5" : ""}`}
                    />
                )}
                <div className='date-item__input w-full flex relative'>
                    {checkbox && (
                        <Checkbox
                            className='date-item__checkbox'
                            checked={isChecked}
                            onChange={(e) => {
                                onCheckboxChange?.(e);
                                setIsChecked(!isChecked);
                                if (!isChecked) {
                                    setInnerDate(new Date());
                                } else {
                                    setInnerDate(null);
                                }
                            }}
                        />
                    )}
                    <Calendar
                        ref={calendarRef}
                        inputId={uniqueId}
                        placeholder={floatLabel ? undefined : name}
                        value={checkbox && !isChecked ? null : innerDate}
                        disabled={checkbox && !isChecked}
                        className={`w-full date-item__calendar ${checkbox ? "date-item__calendar--checkbox" : ""} ${showError ? "p-invalid" : ""}`}
                        panelClassName={mergedPanelClassName || undefined}
                        onChange={(e) => {
                            handleDateChange(e.value as Date | null);
                            const selectedDate = e.value as Date | null | undefined;
                            onChange?.({
                                value: selectedDate,
                                target: {
                                    value: selectedDate ? String(selectedDate.getTime()) : "",
                                },
                            });
                        }}
                        {...calendarProps}
                    />
                    {innerDate && clearButton && (
                        <Button
                            type='button'
                            className='date-item__clear-button'
                            icon='pi pi-times'
                            onClick={handleClearDate}
                            text
                            tooltip='Clear date'
                            tooltipOptions={{ position: "top" }}
                        />
                    )}
                    <div
                        className='date-item__icon input-icon input-icon-right'
                        style={{
                            cursor: props.disabled ? "default" : "pointer",
                        }}
                        onClick={props.disabled ? undefined : openCalendar}
                    >
                        <i className='adms-calendar' />
                    </div>
                </div>
            </div>
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const TextInput = ({
    name,
    colWidth,
    clearButton,
    ref,
    wrapperClassName,
    infoText,
    error = false,
    errorMessage,
    label,
    className: propsClassName,
    ...props
}: TextInputProps): ReactElement => {
    const [value, setValue] = useState<string>(props.value || "");
    const uniqueId = useId();

    useEffect(() => {
        setValue(props.value || "");
    }, [props.value]);

    const handleClear = () => {
        setValue("");
        if (props.onChange) {
            props.onChange({
                target: {
                    name,
                    value: "",
                },
            } as React.ChangeEvent<HTMLInputElement>);
        }
    };

    const showError = error || !!errorMessage;
    const inputClassName = [`w-full`, propsClassName, showError ? "p-invalid" : ""]
        .filter(Boolean)
        .join(" ");

    const content = (
        <span
            className={`p-float-label text-input ${showError ? "p-invalid" : ""} relative ${wrapperClassName || ""}`}
        >
            <InputText
                ref={ref}
                id={uniqueId}
                name={name}
                className={inputClassName}
                style={{ height: `${props.height || 50}px` }}
                tooltipOptions={{ showOnDisabled: true, style: { maxWidth: "490px" } }}
                value={value.trim()}
                aria-describedby={`${uniqueId}-info`}
                onChange={(e) => {
                    props.onChange && props.onChange(e);
                    setValue(e.target.value);
                }}
                {...props}
                pt={{
                    root: {
                        style: {
                            paddingRight: clearButton ? "40px" : "",
                        },
                    },
                }}
            />
            {clearButton && value && (
                <Button
                    type='button'
                    text
                    icon='pi pi-times'
                    className='clear-input-button'
                    onClick={handleClear}
                />
            )}
            {infoText && (
                <small className='input-help' id={`${uniqueId}-info`}>
                    {infoText}
                </small>
            )}
            <FieldLabel text={label ?? name ?? ""} htmlFor={uniqueId} />
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>
                        <TruncatedText text={errorMessage} withTooltip />
                    </small>
                </div>
            )}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const NumberInput = ({
    name,
    colWidth,
    ref,
    wrapperClassName,
    infoText,
    error = false,
    errorMessage,
    label,
    className: propsClassName,
    ...props
}: NumberInputProps): ReactElement => {
    const uniqueId = useId();
    const showError = error || !!errorMessage;
    const inputClassName = [`w-full`, propsClassName, showError ? "p-invalid" : ""]
        .filter(Boolean)
        .join(" ");

    const content = (
        <span
            className={`p-float-label number-input ${showError ? "p-invalid" : ""} relative ${wrapperClassName || ""}`}
        >
            <InputNumber
                ref={ref}
                inputId={uniqueId}
                name={name}
                inputClassName={inputClassName}
                style={{ height: `${(props as { height?: number }).height || 50}px` }}
                tooltipOptions={{ showOnDisabled: true, style: { maxWidth: "490px" } }}
                aria-describedby={infoText ? `${uniqueId}-info` : undefined}
                {...props}
            />
            {infoText && (
                <small className='input-help' id={`${uniqueId}-info`}>
                    {infoText}
                </small>
            )}
            <FieldLabel text={label ?? name ?? ""} htmlFor={uniqueId} />
            {showError && errorMessage && (
                <div className='p-error'>
                    <small>{errorMessage}</small>
                </div>
            )}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const StateDropdown = ({
    name,
    colWidth,
    height = 50,
    style,
    ...props
}: StateDropdownProps): ReactElement => {
    const content = (
        <ComboBox
            optionLabel='label'
            optionValue='id'
            filter={props.filter || true}
            label={name}
            options={STATES_LIST}
            className={`w-full ${props.className || ""}`}
            height={height}
            style={style}
            {...props}
        />
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const PhoneInput = ({
    name,
    colWidth,
    onChange,
    onBlur,
    withValidationMessage = true,
    error: errorProp = false,
    errorMessage: errorMessageProp,
    ...props
}: PhoneInputProps): ReactElement => {
    const inputRef = useRef(null);
    const [error, setError] = useState<string>("");
    const uniqueId = useId();
    const showError = errorProp || !!errorMessageProp || (withValidationMessage && !!error);

    const handleCursorPosition = () => {
        const input = inputRef.current as unknown as HTMLInputElement | null;

        if (input) {
            const value = input.value?.replace(/\D/g, "");
            const firstEmptyPosition = value?.length;

            input?.setSelectionRange &&
                input.setSelectionRange(firstEmptyPosition, firstEmptyPosition);
        }
    };

    const validateAndHandle = (e: InputMaskChangeEvent, isBlur = false) => {
        const { value } = e.target;
        const cleanValue = value?.replace(/[^0-9]/g, "");

        if (cleanValue && cleanValue.length < 10) {
            setError(ERROR_MESSAGES.PHONE);
        } else {
            setError("");
        }

        if (onChange) onChange(e);
        if (isBlur && onBlur) onBlur(e);
    };

    const messageToShow = errorMessageProp ?? (withValidationMessage ? error : undefined);
    const content = (
        <span
            className={`p-float-label relative phone-input text-input ${showError ? "p-invalid" : ""}`}
        >
            <InputMask
                type='tel'
                ref={inputRef}
                mask='999-999-9999'
                className={`w-full phone-input__input ${showError ? "p-invalid" : ""}`}
                style={{ height: `${props.height || 50}px` }}
                onClick={handleCursorPosition}
                id={uniqueId}
                tooltipOptions={{ showOnDisabled: true, style: { maxWidth: "490px" } }}
                autoClear={false}
                unmask={false}
                onChange={(e) => validateAndHandle(e)}
                onBlur={(e) => validateAndHandle(e as unknown as InputMaskChangeEvent, true)}
                {...props}
            />
            <FieldLabel text={name || ""} htmlFor={uniqueId} />
            {showError && messageToShow && (
                <div className='p-error'>
                    <small>{messageToShow}</small>
                </div>
            )}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const EmailInput = ({
    name,
    colWidth,
    onChange,
    onBlur,
    withValidationMessage = false,
    error: errorProp = false,
    errorMessage: errorMessageProp,
    ...props
}: EmailInputProps): ReactElement => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string>("");
    const uniqueId = useId();
    const showError = errorProp || !!errorMessageProp || (withValidationMessage && !!error);

    const validateAndHandle = (e: React.ChangeEvent<HTMLInputElement>, isBlur = false) => {
        const { value } = e.target;

        if (value && !EMAIL_REGEX.test(value)) {
            setError(ERROR_MESSAGES.EMAIL);
        } else {
            setError("");
        }

        if (onChange) onChange(e);
        if (isBlur && onBlur) onBlur(e);
    };

    const messageToShow = errorMessageProp ?? (withValidationMessage ? error : undefined);
    const content = (
        <span
            className={`p-float-label relative email-input text-input ${showError ? "p-invalid" : ""}`}
        >
            <InputText
                type='email'
                ref={inputRef}
                className={`w-full email-input__input ${showError ? "p-invalid" : ""}`}
                style={{ height: `${props.height || 50}px` }}
                id={uniqueId}
                tooltipOptions={{ showOnDisabled: true, style: { maxWidth: "490px" } }}
                onChange={(e) => validateAndHandle(e)}
                onBlur={(e) => validateAndHandle(e, true)}
                {...props}
            />
            <FieldLabel text={name || ""} htmlFor={uniqueId} />
            {showError && messageToShow && (
                <div className='p-error'>
                    <small>{messageToShow}</small>
                </div>
            )}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

interface GlobalSearchInputProps extends InputTextProps {
    onInputChange?: (value: string) => void;
    onIconClick?: () => void;
    enableDebounce?: boolean;
}

export const GlobalSearchInput = ({
    enableDebounce = false,
    onChange,
    onInputChange,
    value,
    placeholder = "Search",
    ...props
}: GlobalSearchInputProps): ReactElement => {
    const uniqueId = useId();
    const [internalValue, setInternalValue] = useState<string>(value || "");

    const debouncedOnChange = debounce((value: string) => {
        if (onInputChange) {
            onInputChange(value);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (enableDebounce) {
            setInternalValue(newValue);
            debouncedOnChange(newValue);
        } else {
            if (onChange) {
                onChange(e);
            }
            if (onInputChange) {
                onInputChange(newValue);
            }
        }
    };

    useEffect(() => {
        if (!enableDebounce) {
            setInternalValue(value || "");
        } else {
            setInternalValue(value || "");
        }
    }, [value, enableDebounce]);

    return (
        <span className='global-search p-input-icon-right'>
            <i className='icon adms-search global-search__icon' />
            <InputText
                id={uniqueId}
                className='global-search__input'
                value={enableDebounce ? internalValue : value || ""}
                onChange={handleChange}
                placeholder={placeholder}
                {...props}
            />
        </span>
    );
};
