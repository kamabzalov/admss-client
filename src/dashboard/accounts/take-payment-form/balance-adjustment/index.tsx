import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import "./index.css";
import { TakePaymentInfo } from "dashboard/accounts/take-payment-form/take-payment-info";
import { AccountOriginalAmounts } from "./original-amounts";
import { AccountNewAmounts } from "./new-amounts";
import { AccountAdjustments } from "./adjusments";

export const AccountBalanceAdjustment = observer((): ReactElement => {
    return (
        <div className='balance-adjustment'>
            <div className='take-payment__control balance-adjustment__control'>
                <AccountOriginalAmounts />
                <AccountNewAmounts />
            </div>

            <div className='take-payment__control balance-adjustment__control'>
                <AccountAdjustments />
            </div>

            <TakePaymentInfo />
        </div>
    );
});
