import { ChangeEvent, ReactElement, useState } from "react";
import { RadioButton, RadioButtonChangeEvent, RadioButtonProps } from "primereact/radiobutton";
import "./index.css";
import { InputNumber, InputNumberChangeEvent, InputNumberProps } from "primereact/inputnumber";
import { Checkbox, CheckboxProps } from "primereact/checkbox";
import { InputText, InputTextProps } from "primereact/inputtext";
import { Calendar, CalendarProps } from "primereact/calendar";

type LabelPosition = "left" | "right" | "top";

interface DashboardRadioProps {
    radioArray: RadioButtonProps[];
}

interface CurrencyInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
}

interface PercentInputProps extends InputNumberProps {
    labelPosition?: LabelPosition;
}

export const DashboardRadio = ({ radioArray }: DashboardRadioProps): ReactElement => {
    const [radioValue, setRadioValue] = useState<string | number>("" || 0);

    return (
        <div className='flex flex-wrap gap-3 justify-content-between radio'>
            {radioArray.map(({ name, title, value }) => (
                <div
                    key={name}
                    className='flex align-items-center justify-content-between radio__item radio-item border-round'
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
    const [inputValue, setInputValue] = useState<number | null>(value || 0);
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
                <InputNumber
                    {...props}
                    minFractionDigits={2}
                    locale='en-US'
                    value={inputValue}
                    onChange={(e: InputNumberChangeEvent) => setInputValue(e.value)}
                />
            </div>
        </div>
    );
};

export const PercentInput = ({
    name,
    value,
    title,
    labelPosition = "left",
    ...props
}: PercentInputProps): ReactElement => {
    const [inputValue, setInputValue] = useState<number | null>(value || 0);
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
                <InputNumber
                    {...props}
                    inputId={name}
                    minFractionDigits={2}
                    name={name}
                    value={inputValue}
                    onChange={(e: InputNumberChangeEvent) => setInputValue(e.value)}
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
            <label>{name}</label>
            <span className='p-inputgroup-addon'>
                <Checkbox {...props} />
            </span>
        </div>
    );
};

export const SearchInput = ({
    name,
    value,
    height = "50px",
    title,
    ...props
}: InputTextProps): ReactElement => {
    const [inputValue, setInputValue] = useState<string>(value || "");
    return (
        <div
            key={name}
            style={{
                height,
            }}
            className='flex align-items-center search-input'
        >
            <span className='p-float-label search-input__wrapper'>
                <InputText
                    {...props}
                    value={inputValue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                />
                <label className='float-label search-input__label'>{title}</label>
            </span>
            <div className='search-input__icon input-icon input-icon-right'>
                <i className='adms-search' />
            </div>
        </div>
    );
};

export const DateInput = ({ name, ...props }: CalendarProps): ReactElement => (
    <div className='p-inputgroup flex-1 w-full date-input'>
        <Calendar placeholder={name} {...props} className='date-input__calendar' />
        <span className='p-inputgroup-addon'>
            <i className='adms-support-history' />
        </span>
    </div>
);
