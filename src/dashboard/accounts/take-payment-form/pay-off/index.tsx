import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumberProps } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import "./index.css";
import { InfoSection } from "dashboard/accounts/form/information/info-section";
import { InputTextarea } from "primereact/inputtextarea";

const PayOffItem = observer(({ title, value }: InputNumberProps): ReactElement => {
    return (
        <div className='take-payment__item'>
            <label className='take-payment__label'>{title}</label>
            <CurrencyInput className='take-payment__input' value={value} />
        </div>
    );
});

export const AccountPayOff = observer((): ReactElement => {
    const paymentMethods = [
        { label: "Method 1", value: "method1" },
        { label: "Method 2", value: "method2" },
    ];

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
                        <Dropdown id='pmtMethod' options={paymentMethods} />
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
                <div className='take-payment__info'>
                    <InfoSection
                        title='Current Status'
                        details={[
                            `Past Due Amt: $0.00`,
                            `Current Due: $0.00`,
                            `Down/Pickup Due: $0.00`,
                            `Fees: $0.00`,
                            `Total Due: $0.00`,
                            `Current Balance: $0.00`,
                        ]}
                    />

                    <InfoSection
                        title='Collection Details'
                        details={[
                            `Regular Pmt: $0.00 Monthly`,
                            `Next Pmt. due: 07/07/2024`,
                            `Days Overdue: 3`,
                            `Last Paid: Never`,
                            `Last Paid Days: n/a`,
                            `Last Late: Never`,
                        ]}
                    />

                    <div className='account-note mt-3'>
                        <span className='p-float-label'>
                            <InputTextarea id='account-memo' className='account-note__input' />
                            <label htmlFor='account-memo'>Account Memo</label>
                        </span>
                        <Button
                            severity='secondary'
                            className='account-note__button'
                            label='Save'
                        />
                    </div>
                    <div className='account-note mt-3'>
                        <span className='p-float-label'>
                            <InputTextarea id='account-payment' className='account-note__input' />
                            <label htmlFor='account-payment'>Payment Alert</label>
                        </span>
                        <Button
                            severity='secondary'
                            className='account-note__button'
                            label='Save'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});
