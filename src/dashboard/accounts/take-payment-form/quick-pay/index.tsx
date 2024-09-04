import { ReactElement } from "react";

import { observer } from "mobx-react-lite";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { TakePaymentInfo } from "dashboard/accounts/take-payment-form/take-payment-info";

import "./index.css";
import { Button } from "primereact/button";
import { ACCOUNT_PAYMENT_METHODS } from "common/constants/account-options";

const cashDrawers = [
    { label: "Drawer 1", value: "drawer1" },
    { label: "Drawer 2", value: "drawer2" },
];

const date = new Date();
const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const AccountQuickPay = observer((): ReactElement => {
    return (
        <div className='quick-pay'>
            <div className='quick-pay__column'>
                <div className='take-payment__card'>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Payment Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-red'>
                        <label className='take-payment__label'>Fees Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-red'>
                        <label className='take-payment__label flex-1'>
                            New late fees due as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>
                            Interest Due as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Principal Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item color-bold'>
                        <label className='take-payment__label flex-1'>
                            Total Payoff as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>
                </div>

                <div className='take-payment__card'>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payment Date</label>
                        <DateInput className='take-payment__input' />
                    </div>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Pmt Method</label>
                        <Dropdown
                            id='pmtMethod'
                            options={ACCOUNT_PAYMENT_METHODS}
                            optionValue='id'
                            optionLabel='name'
                        />
                    </div>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Check#</label>
                        <InputText id='checkNumber' />
                    </div>

                    <hr className='form-line' />

                    <div className='quick-pay__total'>
                        <h3 className='quick-pay__title color-green'>Total Amount Paid:</h3>
                        <div className='quick-pay__input'>
                            <CurrencyInput className='quick-pay__total-input' value={0} />
                            <Button severity='secondary' icon='pi pi-arrow-right' />
                        </div>
                    </div>

                    <hr className='form-line' />

                    <h3 className='take-payment__title'>Breakdown of Total Paid</h3>

                    <div className='take-payment__item color-dusty-blue'>
                        <label className='take-payment__label'>Down/ Pickup:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item color-red'>
                        <label className='take-payment__label'>Fees:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Direct to Principal:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Contract Payment:</label>
                        <CurrencyInput value={0} />
                    </div>
                </div>
            </div>

            <div className='quick-pay__column'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Audit Information</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Cash Drawer</label>
                        <Dropdown
                            id='cashDrawer'
                            className='take-payment__input--small'
                            options={cashDrawers}
                        />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payment Taken By:</label>
                        <InputText className='take-payment__input--small' />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payment Notes:</label>
                        <InputText className='take-payment__input--small' />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Amount Tendered:</label>
                        <InputText className='take-payment__input--small' />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Change:</label>
                        <InputText className='take-payment__input--small' />
                    </div>
                </div>

                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Payment Distribution</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label color-dusty-blue'>
                            Down/ Pickup Pmt:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-red'>
                        <label className='take-payment__label'>Fees:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Principal:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Additional Principal:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-green'>
                        <label className='take-payment__label'>Interest:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-purple'>
                        <label className='take-payment__label'>Taxes Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label color-deep-blue'>Total Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Next Pmt Due:</label>
                        <span className='take-payment__value'>07/15/2024</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Remaining Past Due:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label color-green'>New Acct Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label color-violet'>
                            New Down Pmt Balance:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label color-red'>New Fees Added:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item color-red take-payment__item--bold'>
                        <label className='take-payment__label'>New Fees Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item take-payment__item--bold take-payment__item--subtitle'>
                        <label className='take-payment__label'>New Total Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                </div>
            </div>

            <div className='take-payment__column'>
                <TakePaymentInfo />
            </div>
        </div>
    );
});
