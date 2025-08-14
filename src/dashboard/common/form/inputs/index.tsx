import { CSSProperties, LegacyRef, ReactElement, useEffect, useId, useRef, useState } from "react";
import { RadioButton, RadioButtonChangeEvent, RadioButtonProps } from "primereact/radiobutton";
import "./index.css";
import { InputNumber, InputNumberProps } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent, CheckboxProps } from "primereact/checkbox";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { InputText, InputTextProps } from "primereact/inputtext";
import { STATES_LIST } from "common/constants/states";
import { Button } from "primereact/button";
import { InputMask, InputMaskChangeEvent, InputMaskProps } from "primereact/inputmask";
import { useCursorToStart } from "common/hooks";
import { ComboBox } from "../dropdown";
import { DEFAULT_FILTER_THRESHOLD } from "common/settings";

type LabelPosition = "left" | "right" | "top";

interface DashboardRadioProps {
    radioArray: RadioButtonProps[];
    style?: CSSProperties;
    disabled?: boolean;
    initialValue?: string | number | null;
    onChange?: (value: string | number) => void;
    wrapperClassName?: string;
    children?: React.ReactNode;
}

interface CurrencyInputProps extends InputNumberProps {
    currencyIcon?: "dollar" | "percent";
    labelPosition?: LabelPosition;
    coloredEmptyValue?: boolean;
    wrapperClassName?: string;
}

interface PercentInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
    floatLabel?: boolean;
    emptyValue?: boolean;
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

interface DateInputProps extends CalendarProps {
    date?: number | Date | string;
    colWidth?: Range<1, 13>;
    checkbox?: boolean;
    checkboxWithLabel?: boolean;
    emptyDate?: boolean;
    clearButton?: boolean;
    floatLabel?: boolean;
    onClearAction?: () => void;
}

interface TextInputProps extends InputTextProps {
    colWidth?: Range<1, 13>;
    clearButton?: boolean;
    ref?: React.RefObject<HTMLInputElement>;
    wrapperClassName?: string;
    infoText?: string;
}

interface PhoneInputProps extends Omit<InputMaskProps, "onChange" | "onBlur"> {
    colWidth?: Range<1, 13>;
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
}

interface StateDropdownProps extends DropdownProps {
    colWidth?: Range<1, 13>;
}

interface DateInputProps extends CalendarProps {
    checked?: boolean;
    onCheckboxChange?: (e: CheckboxChangeEvent) => void;
}

export const DashboardRadio = ({
    radioArray,
    initialValue,
    style,
    disabled,
    wrapperClassName,
    onChange,
    children,
}: DashboardRadioProps): ReactElement => {
    const [radioValue, setRadioValue] = useState<string>("");

    const handleRadioChange = (e: RadioButtonChangeEvent) => {
        setRadioValue(String(e.value));
        onChange?.(String(e.value));
    };

    useEffect(() => {
        if (initialValue !== undefined && initialValue !== null) {
            setRadioValue(String(initialValue));
        }
    }, [initialValue]);

    return (
        <section
            className={`flex flex-wrap row-gap-3 justify-content-between radio ${wrapperClassName || ""}`}
        >
            {radioArray.map(({ name, title, value }) => {
                return (
                    <div
                        key={name}
                        className='flex align-items-center justify-content-between radio__item radio-item border-round'
                        style={style}
                    >
                        <div className='radio-item__input flex align-items-center justify-content-center'>
                            <RadioButton
                                inputId={name}
                                name={name}
                                disabled={disabled}
                                value={String(value)}
                                onChange={handleRadioChange}
                                checked={radioValue === String(value)}
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
    currencyIcon = "dollar",
    coloredEmptyValue = false,
    wrapperClassName,
    ...props
}: CurrencyInputProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniqueId = useId();

    useCursorToStart(containerRef);

    return (
        <div
            key={name}
            className={`flex align-items-center justify-content-between currency-item relative ${wrapperClassName || ""}`}
            ref={containerRef}
        >
            <label
                htmlFor={uniqueId}
                className={`currency-item__label ${labelPosition === "top" && "label-top"}`}
            >
                {title}
            </label>
            <div className='currency-item__input flex justify-content-center'>
                {currencyIcon === "dollar" && (
                    <div className='currency-item__icon input-icon input-icon-left'>
                        <i className='icon adms-dollar-sign' />
                    </div>
                )}
                {currencyIcon === "percent" && (
                    <div className='currency-item__icon input-icon input-icon-left'>
                        <i className='icon adms-percentage' />
                    </div>
                )}
                <InputNumber
                    inputId={uniqueId}
                    minFractionDigits={2}
                    maxFractionDigits={2}
                    min={0}
                    locale='en-US'
                    value={value || 0}
                    inputClassName={`${coloredEmptyValue && !value ? "currency-item__input--empty" : ""}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export const PercentInput = ({
    name,
    title,
    labelPosition = "left",
    emptyValue = false,
    floatLabel = false,
    ...props
}: PercentInputProps): ReactElement => {
    const uniqueId = useId();
    return (
        <div
            key={name}
            className='flex align-items-center justify-content-between percent-item relative'
        >
            <label
                htmlFor={uniqueId}
                className={`percent-item__label ${!props.value && floatLabel ? "percent-item__label--empty" : ""} ${labelPosition === "top" && "label-top"}`}
            >
                {title}
            </label>
            <div className='percent-item__input flex justify-content-center'>
                <InputNumber
                    min={0}
                    minFractionDigits={2}
                    inputId={uniqueId}
                    name={name}
                    inputClassName={`${props.value ? "percent-item__input--filled" : "percent-item__input--empty"}`}
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
        </div>
    );
};

export const BorderedCheckbox = ({
    name,
    height = "50px",
    ...props
}: CheckboxProps): ReactElement => {
    return (
        <div
            style={{
                height,
            }}
            className='p-inputgroup flex-1 w-full align-items-center justify-content-between bordered-checkbox'
        >
            <label
                className={`cursor-pointer ${props.disabled ? "p-disabled" : ""}`}
                htmlFor={name}
            >
                {name}
            </label>
            <span className='p-inputgroup-addon'>
                <Checkbox inputId={name} {...props} />
            </span>
        </div>
    );
};

interface SearchInputProps extends DropdownProps {
    onInputChange?: (value: string) => void;
    onIconClick?: () => void;
}

export const SearchInput = ({
    height = "50px",
    title,
    onInputChange,
    onIconClick,
    ...props
}: SearchInputProps): ReactElement => {
    const dropdownRef: LegacyRef<any> = useRef(null);

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
        <div
            key={props.name}
            style={{
                height,
            }}
            className='flex align-items-center search-input'
        >
            <span className='p-float-label search-input__wrapper'>
                <Dropdown
                    ref={dropdownRef}
                    filter={props.options && props.options?.length > DEFAULT_FILTER_THRESHOLD}
                    autoFocus={false}
                    onInput={handleOnInputChange}
                    optionLabel='name'
                    editable
                    placeholder={title}
                    {...props}
                    pt={{
                        trigger: {
                            className: "hidden",
                        },
                    }}
                />
                <label className='float-label search-input__label'>{title}</label>
            </span>
            <button
                className='search-input__icon input-icon input-icon-right'
                onClick={onIconClick}
                type='button'
            >
                <i className='icon adms-table-search' />
            </button>
        </div>
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
    onClearAction,
    ...props
}: DateInputProps): ReactElement => {
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
        <div
            key={name}
            className={`flex align-items-center justify-content-between date-item relative ${
                innerDate ? "date-item--filled" : "date-item--empty"
            }`}
        >
            {((!checkbox && floatLabel) ||
                (checkbox && !isChecked && floatLabel) ||
                (checkbox && checkboxWithLabel && isChecked)) && (
                <label
                    htmlFor={uniqueId}
                    className={`date-item__label ${innerDate ? "" : "date-item__label--empty"} label-top ${checkbox && !isChecked ? "ml-5" : ""}`}
                >
                    {name}
                </label>
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
                    className={`w-full date-item__calendar ${checkbox && "date-item__calendar--checkbox"}`}
                    onChange={(e) => handleDateChange(e.value as Date | null)}
                    {...props}
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
                <div className='date-item__icon input-icon input-icon-right' onClick={openCalendar}>
                    <i className='adms-calendar' />
                </div>
            </div>
        </div>
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

    const content = (
        <span className={`p-float-label relative ${wrapperClassName || ""}`}>
            <InputText
                ref={ref}
                id={uniqueId}
                className='w-full'
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
            <label htmlFor={uniqueId} className='float-label'>
                {name}
            </label>
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};

export const StateDropdown = ({ name, colWidth, ...props }: StateDropdownProps): ReactElement => {
    const content = (
        <ComboBox
            optionLabel='label'
            optionValue='id'
            filter={props.filter || true}
            label={name}
            options={STATES_LIST}
            className={`w-full ${props.className || ""}`}
            style={{ height: `${props.height || 50}px` }}
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
    ...props
}: PhoneInputProps): ReactElement => {
    const inputRef = useRef(null);
    const [error, setError] = useState<string>("");
    const uniqueId = useId();

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
            setError("Phone number is not valid");
        } else {
            setError("");
        }

        if (onChange) onChange(e);
        if (isBlur && onBlur) onBlur(e);
    };

    const content = (
        <span className='p-float-label relative phone-input'>
            <InputMask
                type='tel'
                ref={inputRef}
                mask='999-999-9999'
                className={`w-full phone-input__input ${error ? "p-invalid" : ""}`}
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
            <label htmlFor={uniqueId} className='float-label'>
                {name}
            </label>
            {error && <div className='p-error pt-2'>{error}</div>}
        </span>
    );

    return colWidth ? <div className={`col-${colWidth}`}>{content}</div> : content;
};
