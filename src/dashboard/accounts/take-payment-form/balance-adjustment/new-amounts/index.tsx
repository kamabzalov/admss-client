import { TextInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const AccountNewAmounts = observer((): ReactElement => {
    const store = useStore().accountStore;
    const {
        accountPaymentsInfo: { NewAmounts },
    } = store;
    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>New Amounts</h3>

            <TextInput
                name='adjustmentComment'
                label='Adjustment Comment'
                className='balance-adjustment__input mt-2'
            />

            <hr className='form-line' />

            <div className='take-payment__item'>
                <label className='take-payment__label'>Principal Paid:</label>
                <span className='take-payment__value'>$ {NewAmounts?.PrincipalPaid || "0.00"}</span>
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Interest Paid:</label>
                <span className='take-payment__value'>$ {NewAmounts?.InterestPaid || "0.00"}</span>
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Extra Principal Pmts:</label>
                <span className='take-payment__value'>
                    $ {NewAmounts?.ExtraPrincipalPmts || "0.00"}
                </span>
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Down Payment Paid:</label>
                <span className='take-payment__value'>
                    $ {NewAmounts?.DownPaymentPaid || "0.00"}
                </span>
            </div>
            <div className='take-payment__item take-payment__item--bold'>
                <label className='take-payment__label'>Total Paid:</label>
                <span className='take-payment__value'>$ {NewAmounts?.TotalPaid || "0.00"}</span>
            </div>

            <hr className='form-line' />

            <div className='take-payment__item take-payment__item--bold color-green'>
                <label className='take-payment__label text-lg'>New Balance:</label>
                <span className='take-payment__value text-lg'>
                    $ {NewAmounts?.NewBalance || "0.00"}
                </span>
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Next Payment Due:</label>
                <span className='take-payment__value'>{NewAmounts?.NextPmtDue}</span>
            </div>
        </div>
    );
});
