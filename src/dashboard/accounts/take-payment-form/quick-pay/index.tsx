import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { TakePaymentInfo } from "dashboard/accounts/take-payment-form/take-payment-info";

import "./index.css";
import { AccountAuditInfo } from "./audit-info";
import { AccountPaymentDistribution } from "./payment-distribution";
import { AccountDownPaymentInfo } from "./down-payment";
import { AccountTotalAmount } from "./total-amount";

export const AccountQuickPay = observer((): ReactElement => {
    return (
        <div className='quick-pay'>
            <div className='take-payment__control quick-pay__control'>
                <AccountDownPaymentInfo />
                <AccountTotalAmount />
            </div>

            <div className='take-payment__control quick-pay__control'>
                <AccountAuditInfo />
                <AccountPaymentDistribution />
            </div>

            <TakePaymentInfo />
        </div>
    );
});
