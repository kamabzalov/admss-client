import { DealTotalsProfit } from "./totals-profit";
import { DealProfitCommission } from "./commission";
import { DealFIProfit } from "./FI-profit";
import { DealVehicleProfit } from "./vehicle-profit";
import "./index.css";
import { observer } from "mobx-react-lite";
import { InputNumberProps } from "primereact/inputnumber";
import { ReactElement, useState } from "react";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { ComboBox } from "dashboard/common/form/dropdown";

enum CURRENCY_OPTIONS {
    DOLLAR = "$",
    PERCENT = "%",
}

interface DealProfitItemProps extends InputNumberProps {
    numberSign?: "+" | "-" | "=";
    currency?: CURRENCY_OPTIONS | string;
    currencySelect?: boolean;
    withInput?: boolean;
    checkboxValue?: boolean;
    checkboxOnChange?: (value: boolean) => void;
    fieldName?: string;
    justify?: "start" | "end" | "between";
    includes?: boolean;
    includeFirst?: boolean | undefined;
    includeSecond?: boolean | undefined;
    includeFirstOnChange?: (value: boolean) => void;
    includeSecondOnChange?: (value: boolean) => void;
}

export const DealProfitItem = observer(
    ({
        title,
        numberSign,
        fieldName,
        withInput = false,
        currency,
        currencySelect = false,
        checkboxValue,
        checkboxOnChange,
        justify = "between",
        includes = false,
        includeFirst,
        includeSecond,
        includeFirstOnChange,
        includeSecondOnChange,
        ...props
    }: DealProfitItemProps): ReactElement => {
        const [fieldChanged, setFieldChanged] = useState(false);
        const [currencySelectValue, setCurrencySelectValue] = useState<CURRENCY_OPTIONS>(
            CURRENCY_OPTIONS.DOLLAR
        );

        const handleChange = (event: any) => {
            setFieldChanged(true);
            props.onChange?.(event);
        };

        return (
            <div
                className={`deal-profit__item ${props?.className || ""} justify-content-${justify}`}
            >
                {checkboxValue !== undefined && checkboxOnChange !== undefined && (
                    <Checkbox
                        inputId={`${fieldName}-checkbox`}
                        checked={checkboxValue}
                        onChange={({ checked }) => {
                            checkboxOnChange?.(!!checked);
                        }}
                    />
                )}
                <label className='deal-profit__label'>
                    {numberSign && <span className='deal-profit__sign'>({numberSign})</span>}
                    &nbsp;{title}
                </label>
                {withInput ? (
                    <>
                        {currencySelect && (
                            <ComboBox
                                options={Object.values(CURRENCY_OPTIONS)}
                                value={currencySelectValue}
                                onChange={(e) => {
                                    setCurrencySelectValue(e.value as CURRENCY_OPTIONS);
                                }}
                                className={`deal-profit__currency-select`}
                            />
                        )}
                        <CurrencyInput
                            className={`deal-profit__input ${fieldChanged ? "input-change" : ""}`}
                            {...props}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    <div className='deal-profit__value'>
                        {currency && <span className='deal-profit__currency'>{currency}</span>}
                        &nbsp;
                        {currency
                            ? props.value?.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              })
                            : props.value}
                    </div>
                )}
                {includes && (
                    <div className='deal-profit__includes'>
                        {includeFirst !== undefined && (
                            <Checkbox
                                inputId={`${fieldName}-includes-1`}
                                checked={includeFirst}
                                tooltip='Include in Commission1 Base'
                                onChange={({ checked }) => {
                                    includeFirstOnChange?.(!!checked);
                                }}
                            />
                        )}
                        {includeSecond !== undefined && (
                            <Checkbox
                                inputId={`${fieldName}-includes-2`}
                                checked={includeSecond}
                                tooltip='Include in Commission Base'
                                onChange={({ checked }) => {
                                    includeSecondOnChange?.(!!checked);
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
);

export const DealProfit = () => {
    return (
        <div className='deal-profit grid'>
            <div className='col-6'>
                <DealVehicleProfit />
            </div>
            <div className='col-6'>
                <DealProfitCommission />
            </div>
            <div className='col-9'>
                <DealFIProfit />
            </div>
            <div className='col-3'>
                <DealTotalsProfit />
            </div>
        </div>
    );
};
