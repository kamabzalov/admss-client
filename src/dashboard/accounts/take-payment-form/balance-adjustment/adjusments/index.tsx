import { ADJUSTMENT_TYPES } from "common/constants/account-options";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const AccountAdjustments = observer((): ReactElement => {
    const store = useStore().accountStore;
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
    } = store;
    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>Adjustments</h3>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Adjustment Type:</label>
                <Dropdown id='adjType' options={ADJUSTMENT_TYPES} value={AdjType} />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Adjustment Date:</label>
                <DateInput
                    className='take-payment__input'
                    date={AdjDate}
                    onChange={({ target: { value } }) =>
                        store.changeAccountTakePayment("AdjDate", String(value))
                    }
                />
            </div>

            <hr className='form-line' />

            <div className='take-payment__item'>
                <label className='take-payment__label'>Principal Adj:</label>
                <CurrencyInput
                    value={AdjPrincipal}
                    onChange={({ value }) =>
                        store.changeAccountTakePayment("AdjPrincipal", value || 0)
                    }
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Interest Adj:</label>
                <CurrencyInput
                    value={AdjInterest}
                    onChange={({ value }) =>
                        store.changeAccountTakePayment("AdjInterest", value || 0)
                    }
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Extra Principal Adj:</label>
                <CurrencyInput
                    value={AdjExtraPrincipal}
                    onChange={({ value }) =>
                        store.changeAccountTakePayment("AdjExtraPrincipal", value || 0)
                    }
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Down Pmt Adj:</label>
                <CurrencyInput
                    value={AdjDownPayment}
                    onChange={({ value }) =>
                        store.changeAccountTakePayment("AdjDownPayment", value || 0)
                    }
                />
            </div>
            <div className='take-payment__item take-payment__item--bold'>
                <label className='take-payment__label'>Total Adj:</label>
                <span className='take-payment__value'>$ {Total_Adjustments || "0.00"}</span>
            </div>
        </div>
    );
});
