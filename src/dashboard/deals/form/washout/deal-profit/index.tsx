import "./index.css";
import { observer } from "mobx-react-lite";
import { InputNumberProps } from "primereact/inputnumber";
import { ReactElement, useState } from "react";
import {
    CURRENCY_OPTIONS,
    CURRENCY_SELECT_OPTIONS,
    CurrencyInput,
} from "dashboard/common/form/inputs";
import { Checkbox } from "primereact/checkbox";
import { ComboBox } from "dashboard/common/form/dropdown";
import { DealTotalsProfit } from "dashboard/deals/form/washout/deal-profit/totals-profit";
import { DealProfitCommission } from "dashboard/deals/form/washout/deal-profit/commission";
import { DealVehicleProfit } from "dashboard/deals/form/washout/deal-profit/vehicle-profit";
import { DealProfitFinanceWorksheet } from "dashboard/deals/form/washout/deal-profit/finance-worksheet";
import { DealInterestProfit } from "dashboard/deals/form/washout/deal-profit/interest-profit";
import { TruncatedText } from "dashboard/common/display";
import { useStore } from "store/hooks";
import { INCLUDE_OPTIONS } from "store/stores/deal";

interface DealProfitItemProps extends InputNumberProps {
    numberSign?: "+" | "-" | "=";
    currency?: CURRENCY_OPTIONS;
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
    includeCheckboxFieldName?: string;
    additionalValue?: string;
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
        includeCheckboxFieldName,
        onCurrencySelect,
        additionalValue,
        ...props
    }: DealProfitItemProps): ReactElement => {
        const [fieldChanged, setFieldChanged] = useState(false);
        const { toggleIncludeCheckbox, getIncludeCheckboxValue } = useStore().dealStore;

        const handleChange = (event: any) => {
            setFieldChanged(true);
            props.onChange?.(event);
        };

        const handleCurrencySelect = (value: 0 | 1) => {
            onCurrencySelect?.(value);
        };

        const handleFirstCheckboxChange = () => {
            if (includeCheckboxFieldName) {
                const currentValue = getIncludeCheckboxValue(includeCheckboxFieldName);
                if (currentValue === INCLUDE_OPTIONS.COMMISSION1) {
                    toggleIncludeCheckbox(includeCheckboxFieldName, null);
                } else {
                    toggleIncludeCheckbox(includeCheckboxFieldName, INCLUDE_OPTIONS.COMMISSION1);
                }
            } else {
                if (includeCheckbox === INCLUDE_OPTIONS.COMMISSION1) {
                    includeCheckboxOnChange?.(null);
                } else {
                    includeCheckboxOnChange?.(INCLUDE_OPTIONS.COMMISSION1);
                }
            }
        };

        const handleSecondCheckboxChange = () => {
            if (includeCheckboxFieldName) {
                const currentValue = getIncludeCheckboxValue(includeCheckboxFieldName);
                if (currentValue === INCLUDE_OPTIONS.COMMISSION) {
                    toggleIncludeCheckbox(includeCheckboxFieldName, null);
                } else {
                    toggleIncludeCheckbox(includeCheckboxFieldName, INCLUDE_OPTIONS.COMMISSION);
                }
            } else {
                if (includeCheckbox === INCLUDE_OPTIONS.COMMISSION) {
                    includeCheckboxOnChange?.(null);
                } else {
                    includeCheckboxOnChange?.(INCLUDE_OPTIONS.COMMISSION);
                }
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
                                    handleCurrencySelect(e.value as 0 | 1);
                                }}
                                className={`deal-profit__currency-select currency-select`}
                                panelClassName='currency-select__list'
                            />
                        )}
                        <CurrencyInput
                            currencyIcon={
                                currencySelectValue !== undefined
                                    ? CURRENCY_SELECT_OPTIONS.find(
                                          (option) => option.value === currencySelectValue
                                      )?.label
                                    : currency
                            }
                            className={`deal-profit__input ${fieldChanged ? "input-change" : ""}`}
                            {...props}
                            coloredEmptyValue
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
                {additionalValue && (
                    <span className='deal-profit__additional-value'>{additionalValue}</span>
                )}
                {includes && (
                    <div className='deal-profit__includes'>
                        {(includeCheckbox !== undefined || includeCheckboxFieldName) && (
                            <>
                                <Checkbox
                                    inputId={`${fieldName}-includes-1`}
                                    checked={
                                        includeCheckboxFieldName
                                            ? getIncludeCheckboxValue(includeCheckboxFieldName) ===
                                              "COMMISSION1"
                                            : includeCheckbox === INCLUDE_OPTIONS.COMMISSION1
                                    }
                                    tooltip='Include in Commission1 Base'
                                    onChange={() => {
                                        handleFirstCheckboxChange();
                                    }}
                                />
                                <Checkbox
                                    inputId={`${fieldName}-includes-2`}
                                    checked={
                                        includeCheckboxFieldName
                                            ? getIncludeCheckboxValue(includeCheckboxFieldName) ===
                                              "COMMISSION"
                                            : includeCheckbox === INCLUDE_OPTIONS.COMMISSION
                                    }
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
            <div className='col-3 pt-0'>
                <DealVehicleProfit />
            </div>
            <div className='col-4 pt-0'>
                <DealProfitCommission />
            </div>
            <div className='col-5 pt-0'>
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
