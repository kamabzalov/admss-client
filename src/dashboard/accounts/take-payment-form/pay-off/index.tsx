import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumberProps } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import "./index.css";
import { TakePaymentInfo } from "dashboard/accounts/take-payment-form/take-payment-info";
import { ACCOUNT_PAYMENT_METHODS } from "common/constants/account-options";

const PayOffItem = observer(({ title, value }: InputNumberProps): ReactElement => {
    return (
        <div className='take-payment__item'>
            <label className='take-payment__label'>{title}</label>
            <CurrencyInput className='take-payment__input' value={value} />
        </div>
    );
});

export const AccountPayOff = observer((): ReactElement => {
    const cashDrawers = [
        { label: "Drawer 1", value: "drawer1" },
        { label: "Drawer 2", value: "drawer2" },
    ];

    return (
        <div className='grid pay-off'>
            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Cash Deal Payoff</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Payment Balance</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Amount Financed/Balance</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <PayOffItem title='(-) Reserve' value={0} />
                    <PayOffItem title='(-) Discount' value={0} />
                    <PayOffItem title='(-) Loan Fees' value={0} />
                    <PayOffItem title='(-) Service Contract Withholding' value={0} />
                    <PayOffItem title='(-) GAP Withholding' value={0} />
                    <PayOffItem title='(-) VSI Withholding' value={0} />
                    <PayOffItem title='(-) Miscellaneous Withholding' value={0} />
                    <PayOffItem title='(+) Miscellaneous Profit/Commission' value={0} />
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>(=) Net Check from Lender</label>
                    </div>
                </div>
                <div className='take-payment__card mt-3'>
                    <h3 className='take-payment__title'>Unearned Interest</h3>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Unearned Interest</label>{" "}
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <div className='take-payment__item px-8 text-center pt-3'>
                        <span>
                            <b>!</b> Note: You do <b>NOT</b> owe this amount to the customer
                        </span>
                    </div>
                </div>
            </div>

            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Pay Off Account</h3>

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
                    <PayOffItem title='Balance Paydown' value={0} />
                    <PayOffItem title='Down Payment' value={0} />
                    <PayOffItem title='Fees Payment' value={0} />
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Total Paid:</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Cash Drawer</label>
                        <Dropdown id='cashDrawer' options={cashDrawers} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payoff Taken By</label>
                        <InputText id='payoffTakenBy' />
                    </div>
                    <Button label='Apply Payment' className='pay-off__button' outlined />
                </div>

                <div className='take-payment__card mt-3'>
                    <h3 className='take-payment__title'>White Offs</h3>
                    <div className='take-payment__item'>
                        <Checkbox checked inputId='whiteOffs' />
                        <label className='take-payment__label'>
                            Do not write off these amounts, show them as still owing.
                        </label>
                    </div>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Principal White Off:</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Interest White Off:</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Late Charge White Off:</label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>
                </div>
            </div>

            <div className='col-12 md:col-4'>
                <TakePaymentInfo />
            </div>
        </div>
    );
});
