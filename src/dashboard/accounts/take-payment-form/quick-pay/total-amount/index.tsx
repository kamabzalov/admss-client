import { ACCOUNT_PAYMENT_METHODS } from "common/constants/account-options";
import { TOAST_LIFETIME } from "common/settings";
import { DateInput, CurrencyInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import { checkAccountPaymentInfo } from "http/services/accounts.service";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "store/hooks";

export const AccountTotalAmount = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().accountStore;
    const toast = useToast();
    const {
        accountTakePayment: {
            PaymentDate,
            PaymentMethod,
            CheckNumber,
            TotalAmount,
            BreakdownDownPayment,
            BreakdownFees,
            BreakdownPrincipal,
            BreakdownContractPayment,
        },
        changeAccountTakePayment,
    } = store;

    const handleCheckPayment = async () => {
        if (TotalAmount && id) {
            const response = await checkAccountPaymentInfo(id, {
                TotalAmount,
            });

            if (response?.error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: response.error,
                    life: TOAST_LIFETIME,
                });
            }
        }
    };

    return (
        <div className='take-payment__card'>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payment Date</label>
                <DateInput
                    className='take-payment__input'
                    date={PaymentDate}
                    onChange={(e) =>
                        changeAccountTakePayment("PaymentDate", e.target.value as string)
                    }
                />
            </div>

            <div className='take-payment__item'>
                <label className='take-payment__label'>Pmt Method</label>
                <Dropdown
                    id='pmtMethod'
                    options={[...ACCOUNT_PAYMENT_METHODS]}
                    value={PaymentMethod}
                    optionValue='name'
                    optionLabel='name'
                />
            </div>

            <div className='take-payment__item'>
                <label className='take-payment__label'>Check#</label>
                <InputText
                    id='checkNumber'
                    value={CheckNumber}
                    onChange={(e) => {
                        changeAccountTakePayment("CheckNumber", e.target.value);
                    }}
                />
            </div>

            <hr className='form-line' />

            <div className='quick-pay__total'>
                <h3 className='quick-pay__title color-green'>Total Amount Paid:</h3>
                <div className='quick-pay__input'>
                    <CurrencyInput
                        className='quick-pay__total-input'
                        value={TotalAmount}
                        onChange={({ value }) => {
                            changeAccountTakePayment("TotalAmount", value as number);
                        }}
                    />
                    <Button
                        severity='secondary'
                        icon='pi pi-arrow-right'
                        onClick={handleCheckPayment}
                    />
                </div>
            </div>

            <hr className='form-line' />

            <h3 className='take-payment__title'>Breakdown of Total Paid</h3>

            <div className='take-payment__item color-dusty-blue'>
                <label className='take-payment__label'>Down/ Pickup:</label>
                <CurrencyInput
                    value={BreakdownDownPayment}
                    onChange={({ value }) => {
                        changeAccountTakePayment("BreakdownDownPayment", value as number);
                    }}
                />
            </div>
            <div className='take-payment__item color-red'>
                <label className='take-payment__label'>Fees:</label>
                <CurrencyInput
                    value={BreakdownFees}
                    onChange={({ value }) => {
                        changeAccountTakePayment("BreakdownFees", value as number);
                    }}
                />
            </div>
            <div className='take-payment__item color-green'>
                <label className='take-payment__label'>Direct to Principal:</label>
                <CurrencyInput
                    value={BreakdownPrincipal}
                    onChange={({ value }) => {
                        changeAccountTakePayment("BreakdownPrincipal", value as number);
                    }}
                />
            </div>
            <div className='take-payment__item color-green'>
                <label className='take-payment__label'>Contract Payment:</label>
                <CurrencyInput
                    value={BreakdownContractPayment}
                    onChange={({ value }) => {
                        changeAccountTakePayment("BreakdownContractPayment", value as number);
                    }}
                />
            </div>
        </div>
    );
});
