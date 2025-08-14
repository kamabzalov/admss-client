import "./index.css";
import { observer } from "mobx-react-lite";
import { InputNumberProps } from "primereact/inputnumber";
import { ReactElement, useState } from "react";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { ComboBox } from "dashboard/common/form/dropdown";
import { DealTotalsProfit } from "dashboard/deals/form/washout/deal-profit/totals-profit";
import { DealProfitCommission } from "dashboard/deals/form/washout/deal-profit/commission";
import { DealVehicleProfit } from "dashboard/deals/form/washout/deal-profit/vehicle-profit";
import { DealProfitFinanceWorksheet } from "dashboard/deals/form/washout/deal-profit/finance-worksheet";
import { DealInterestProfit } from "dashboard/deals/form/washout/deal-profit/interest-profit";
import { TruncatedText } from "dashboard/common/display";

export enum CURRENCY_OPTIONS {
    DOLLAR = "$",
    PERCENT = "%",
}

const CURRENCY_SELECT_OPTIONS = [
    { label: CURRENCY_OPTIONS.DOLLAR, value: 0 },
    { label: CURRENCY_OPTIONS.PERCENT, value: 1 },
];

export enum INCLUDE_OPTIONS {
    COMMISSION1 = "commission1",
    COMMISSION = "commission",
}

interface DealProfitItemProps extends InputNumberProps {
    numberSign?: "+" | "-" | "=";
    currency?: CURRENCY_OPTIONS | string;
    currencySelectValue?: 0 | 1;
    onCurrencySelect?: (value: 0 | 1) => void;
    withInput?: boolean;
    checkboxValue?: boolean;
    checkboxOnChange?: (value: boolean) => void;
    fieldName?: string;
    justify?: "start" | "end" | "between";
    includes?: boolean;
    includeCheckbox?: INCLUDE_OPTIONS | null;
    includeCheckboxOnChange?: (value: INCLUDE_OPTIONS | null) => void;
}

export const DealProfitItem = observer(
    ({
        title,
        numberSign,
        fieldName,
        withInput = false,
        currency,
        currencySelectValue,
        checkboxValue,
        checkboxOnChange,
        justify = "between",
        includes = false,
        includeCheckbox,
        includeCheckboxOnChange,
        onCurrencySelect,
        ...props
    }: DealProfitItemProps): ReactElement => {
        const [fieldChanged, setFieldChanged] = useState(false);

        const handleChange = (event: any) => {
            setFieldChanged(true);
            props.onChange?.(event);
        };

        const handleFirstCheckboxChange = () => {
            if (includeCheckbox === INCLUDE_OPTIONS.COMMISSION1) {
                includeCheckboxOnChange?.(null);
            } else {
                includeCheckboxOnChange?.(INCLUDE_OPTIONS.COMMISSION1);
            }
        };

        const handleSecondCheckboxChange = () => {
            if (includeCheckbox === INCLUDE_OPTIONS.COMMISSION) {
                includeCheckboxOnChange?.(null);
            } else {
                includeCheckboxOnChange?.(INCLUDE_OPTIONS.COMMISSION);
            }
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
                <span className='deal-profit__label'>
                    {numberSign && <span className='deal-profit__sign'>({numberSign})</span>}
                    &nbsp;{title}
                </span>
                {withInput ? (
                    <>
                        {currencySelectValue !== undefined && (
                            <ComboBox
                                options={CURRENCY_SELECT_OPTIONS}
                                optionLabel='label'
                                optionValue='value'
                                value={currencySelectValue}
                                required
                                onChange={(e) => {
                                    onCurrencySelect?.(e.value as 0 | 1);
                                }}
                                className={`deal-profit__currency-select`}
                            />
                        )}
                        <CurrencyInput
                            currencyIcon={
                                currency === CURRENCY_OPTIONS.PERCENT ? "percent" : "dollar"
                            }
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
                            ? TruncatedText({
                                  withTooltip: true,
                                  text:
                                      props.value?.toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                      }) || "",
                                  className: "deal-profit__value-text",
                              })
                            : props.value}
                    </div>
                )}
                {includes && (
                    <div className='deal-profit__includes'>
                        {includeCheckbox !== undefined && (
                            <>
                                <Checkbox
                                    inputId={`${fieldName}-includes-1`}
                                    checked={includeCheckbox === INCLUDE_OPTIONS.COMMISSION1}
                                    tooltip='Include in Commission1 Base'
                                    onChange={() => {
                                        handleFirstCheckboxChange();
                                    }}
                                />
                                <Checkbox
                                    inputId={`${fieldName}-includes-2`}
                                    checked={includeCheckbox === INCLUDE_OPTIONS.COMMISSION}
                                    tooltip='Include in Commission Base'
                                    onChange={() => {
                                        handleSecondCheckboxChange();
                                    }}
                                />
                            </>
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
            <div className='col-3'>
                <DealVehicleProfit />
            </div>
            <div className='col-4'>
                <DealProfitCommission />
            </div>
            <div className='col-5'>
                <DealProfitFinanceWorksheet />
            </div>
            <div className='col-7'>
                <DealInterestProfit />
            </div>
            <div className='col-5'>
                <DealTotalsProfit />
            </div>
        </div>
    );
};
