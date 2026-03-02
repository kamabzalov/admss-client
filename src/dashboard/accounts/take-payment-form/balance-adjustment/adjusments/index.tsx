import { ADJUSTMENT_TYPES } from "common/constants/account-options";
import { ComboBox } from "dashboard/common/form/dropdown";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import { useStore } from "store/hooks";
import { usePermissions } from "common/hooks";

export const AccountAdjustments = observer((): ReactElement => {
    const store = useStore().accountStore;
    const [fieldChanged, setFieldChanged] = useState<Record<string, boolean>>({});
    const { accountPermissions } = usePermissions();
    const isReadOnly = !accountPermissions.canEditPartialPayments();

    const markFieldChanged = (field: string) => {
        if (isReadOnly) return;
        setFieldChanged((prev) => ({ ...prev, [field]: true }));
    };

    const {
        accountTakePayment: {
            AdjType,
            AdjDate,
            AdjPrincipal,
            AdjInterest,
            AdjExtraPrincipal,
            AdjDownPayment,
        },
        accountExtData: { Total_Adjustments },
        changeAccountTakePayment,
    } = store;

    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>Adjustments</h3>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Adjustment Type:</label>
                <ComboBox
                    id='adjType'
                    className={`take-payment__input ${
                        fieldChanged["AdjType"] ? "input-change" : ""
                    }`}
                    options={[...ADJUSTMENT_TYPES]}
                    value={AdjType}
                    disabled={isReadOnly}
                    onChange={({ value }) => {
                        markFieldChanged("AdjType");
                        changeAccountTakePayment("AdjType", value);
                    }}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Adjustment Date:</label>
                <DateInput
                    className={`take-payment__input ${
                        fieldChanged["AdjDate"] ? "input-change" : ""
                    }`}
                    date={Number(AdjDate)}
                    disabled={isReadOnly}
                    onChange={({ target: { value } }) => {
                        markFieldChanged("AdjDate");
                        changeAccountTakePayment("AdjDate", String(value));
                    }}
                />
            </div>

            <hr className='form-line' />

            <div className='take-payment__item'>
                <label className='take-payment__label'>Principal Adj:</label>
                <CurrencyInput
                    className={`take-payment__input ${
                        fieldChanged["AdjPrincipal"] ? "input-change" : ""
                    }`}
                    value={AdjPrincipal}
                    disabled={isReadOnly}
                    onChange={({ value }) => {
                        markFieldChanged("AdjPrincipal");
                        changeAccountTakePayment("AdjPrincipal", value || 0);
                    }}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Interest Adj:</label>
                <CurrencyInput
                    className={`take-payment__input ${
                        fieldChanged["AdjInterest"] ? "input-change" : ""
                    }`}
                    value={AdjInterest}
                    disabled={isReadOnly}
                    onChange={({ value }) => {
                        markFieldChanged("AdjInterest");
                        changeAccountTakePayment("AdjInterest", value || 0);
                    }}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Extra Principal Adj:</label>
                <CurrencyInput
                    className={`take-payment__input ${
                        fieldChanged["AdjExtraPrincipal"] ? "input-change" : ""
                    }`}
                    value={AdjExtraPrincipal}
                    disabled={isReadOnly}
                    onChange={({ value }) => {
                        markFieldChanged("AdjExtraPrincipal");
                        changeAccountTakePayment("AdjExtraPrincipal", value || 0);
                    }}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Down Pmt Adj:</label>
                <CurrencyInput
                    className={`take-payment__input ${
                        fieldChanged["AdjDownPayment"] ? "input-change" : ""
                    }`}
                    value={AdjDownPayment}
                    disabled={isReadOnly}
                    onChange={({ value }) => {
                        markFieldChanged("AdjDownPayment");
                        changeAccountTakePayment("AdjDownPayment", value || 0);
                    }}
                />
            </div>
            <div className='take-payment__item take-payment__item--bold color-green pt-3'>
                <label className='take-payment__label'>Total Adj:</label>
                <span className='take-payment__value'>$ {Total_Adjustments || "0.00"}</span>
            </div>
        </div>
    );
});
