import { CSSProperties, LegacyRef, ReactElement, useEffect, useRef, useState } from "react";
import { RadioButton, RadioButtonChangeEvent, RadioButtonProps } from "primereact/radiobutton";
import "./index.css";
import { InputNumber, InputNumberProps } from "primereact/inputnumber";
import { Checkbox, CheckboxProps } from "primereact/checkbox";
import { Calendar, CalendarProps } from "primereact/calendar";
import { Dropdown, DropdownProps } from "primereact/dropdown";

type LabelPosition = "left" | "right" | "top";

interface DashboardRadioProps {
    radioArray: RadioButtonProps[];
    style?: CSSProperties;
}

interface CurrencyInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
}

interface PercentInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
}

export const DashboardRadio = ({ radioArray, style }: DashboardRadioProps): ReactElement => {
    const [radioValue, setRadioValue] = useState<string | number>("" || 0);

    return (
        <div className='flex flex-wrap row-gap-3 justify-content-between radio'>
            {radioArray.map(({ name, title, value }) => (
                <div
                    key={name}
                    className='flex align-items-center justify-content-between radio__item radio-item border-round'
                    style={style}
                >
                    <div className='radio-item__input flex align-items-center justify-content-center'>
                        <RadioButton
                            inputId={name}
                            name={name}
                            value={value}
                            onChange={(e: RadioButtonChangeEvent) => setRadioValue(e.value)}
                            checked={radioValue === value}
                        />
                    </div>

                    <label htmlFor={name} className='radio-item__label'>
                        {title}
                    </label>
                </div>
            ))}
        </div>
    );
};

export const CurrencyInput = ({
    name,
    value,
    title,
    labelPosition = "left",
    ...props
}: CurrencyInputProps): ReactElement => {
    return (
        <div
            key={name}
            className={"flex align-items-center justify-content-between currency-item relative"}
        >
            <label className={`currency-item__label ${labelPosition === "top" && "label-top"}`}>
                {title}
            </label>
            <div className='currency-item__input flex justify-content-center'>
                <div className='currency-item__icon input-icon input-icon-left'>$</div>
                <InputNumber minFractionDigits={2} locale='en-US' value={value} {...props} />
            </div>
        </div>
    );
};

export const PercentInput = ({
    name,
    title,
    labelPosition = "left",
    ...props
}: PercentInputProps): ReactElement => {
    return (
        <div
            key={name}
            className='flex align-items-center justify-content-between percent-item relative'
        >
            <label
                htmlFor={name}
                className={`percent-item__label ${labelPosition === "top" && "label-top"}`}
            >
                {title}
            </label>
            <div className='percent-item__input flex justify-content-center'>
                <InputNumber inputId={name} minFractionDigits={2} name={name} {...props} />
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
            <label>{name}</label>
            <span className='p-inputgroup-addon'>
                <Checkbox {...props} />
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
            >
                <i className='icon adms-table' />
            </button>
        </div>
    );
};

interface DateInputProps extends CalendarProps {
    date?: number;
}

export const DateInput = ({ date, name, value, ...props }: DateInputProps): ReactElement => {
    const [innerDate, setInnerDate] = useState<Date>(new Date());

    useEffect(() => {
        if (!!date) {
            const currentDate = new Date(Number(date));
            setInnerDate(currentDate);
        }
    }, [date]);

    const dateToNumber = (selectedDate: Date) => setInnerDate(selectedDate);
    return (
        <div
            key={name}
            className='flex align-items-center justify-content-between date-item relative'
        >
            <label htmlFor={name} className='date-item__label label-top'>
                {name}
            </label>
            <div className='date-item__input flex justify-content-center'>
                <Calendar
                    inputId={name}
                    value={innerDate}
                    onChange={(e) => dateToNumber(e.value as Date)}
                    {...props}
                />
                <div className='date-item__icon input-icon input-icon-right'>
                    <i className='adms-calendar' />
                </div>
            </div>
        </div>
    );
};
