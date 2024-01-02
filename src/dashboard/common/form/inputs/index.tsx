import { useState } from "react";
import { RadioButton, RadioButtonChangeEvent, RadioButtonProps } from "primereact/radiobutton";
import "./index.css";
import { InputNumber, InputNumberChangeEvent, InputNumberProps } from "primereact/inputnumber";

interface DashboardRadioProps {
    radioArray: RadioButtonProps[];
}

export const DashboardRadio = ({ radioArray }: DashboardRadioProps): JSX.Element => {
    const [radioValue, setRadioValue] = useState<string | number>("" || 0);

    return (
        <div className='flex flex-wrap gap-3 justify-content-between dashboard-radio'>
            {radioArray.map(({ name, title, value }) => (
                <div
                    key={name}
                    className='flex align-items-center justify-content-between dashboard-radio__item radio-item border-round'
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

export const CurrencyInput = ({ name, value, title, ...props }: InputNumberProps): JSX.Element => {
    const [inputValue, setInputValue] = useState<number | null>(value || 0);
    return (
        <div
            key={name}
            className='flex align-items-center justify-content-between dashboard-currency__item currency-item'
        >
            <label htmlFor={name} className='currency-item__label'>
                {title}
            </label>
            <div className='currency-item__input flex justify-content-center'>
                <div className='currency-item__icon input-icon input-icon--left'>$</div>
                <InputNumber
                    {...props}
                    minFractionDigits={2}
                    locale='en-US'
                    inputId={name}
                    name={name}
                    value={inputValue}
                    onChange={(e: InputNumberChangeEvent) => setInputValue(e.value)}
                />
            </div>
        </div>
    );
};

export const PercentInput = ({ name, value, title, ...props }: InputNumberProps): JSX.Element => {
    const [inputValue, setInputValue] = useState<number | null>(value || 0);
    return (
        <div
            key={name}
            className='flex align-items-center justify-content-between dashboard-percent__item percent-item'
        >
            <label htmlFor={name} className='percent-item__label'>
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
                <div className='percent-item__icon input-icon input-icon--right'>%</div>
            </div>
        </div>
    );
};
