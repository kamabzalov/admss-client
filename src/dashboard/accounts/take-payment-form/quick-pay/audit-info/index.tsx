import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const AccountAuditInfo = observer((): ReactElement => {
    const store = useStore().accountStore;
    const {
        accountTakePayment: { CashDrawer, PaymentTakenBy, AmountTendered, Notes, Charge },
        changeAccountTakePayment,
        accountDrawers,
    } = store;
    return (
        <div className='take-payment__card'>
            <h3 className='take-payment__title'>Audit Information</h3>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Cash Drawer</label>
                <Dropdown
                    id='cashDrawer'
                    className='take-payment__input--small'
                    value={CashDrawer}
                    optionLabel='drawer'
                    optionValue='drawer'
                    onChange={(e) => changeAccountTakePayment("CashDrawer", e.value)}
                    options={accountDrawers}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payment Taken By:</label>
                <InputText
                    className='take-payment__input--small'
                    value={PaymentTakenBy}
                    onChange={(e) => changeAccountTakePayment("PaymentTakenBy", e.target.value)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Payment Notes:</label>
                <InputText
                    className='take-payment__input--small'
                    value={Notes}
                    onChange={(e) => changeAccountTakePayment("Notes", e.target.value)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Amount Tendered:</label>
                <InputNumber
                    className='take-payment__input--small'
                    value={AmountTendered}
                    onChange={(e) => changeAccountTakePayment("AmountTendered", e.value || 0)}
                />
            </div>
            <div className='take-payment__item'>
                <label className='take-payment__label'>Change:</label>
                <InputNumber
                    className='take-payment__input--small'
                    value={Charge}
                    onChange={(e) => changeAccountTakePayment("Charge", e.value || 0)}
                />
            </div>
        </div>
    );
});
