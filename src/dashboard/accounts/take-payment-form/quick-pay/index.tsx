import { ReactElement } from "react";

import { observer } from "mobx-react-lite";
import { CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InfoSection } from "dashboard/accounts/form/information/info-section";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";

const paymentMethods = [
    { label: "Method 1", value: "method1" },
    { label: "Method 2", value: "method2" },
];

const cashDrawers = [
    { label: "Drawer 1", value: "drawer1" },
    { label: "Drawer 2", value: "drawer2" },
];

const date = new Date();
const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

export const AccountQuickPay = observer((): ReactElement => {
    return (
        <div className='grid quick-pay'>
            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Payment Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Fees Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label flex-1'>
                            New late fees due as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>
                            Interest Due as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Principal Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label flex-1'>
                            Total Payoff as of ${currentDate}:
                        </label>
                        <span className='take-payment__value'>$0.00</span>
                    </div>
                </div>

                <div className='take-payment__card mt-3'>
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

                    <hr className='form-line' />

                    <h3 className='take-payment__title'>Breakdown of Total Paid</h3>

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down/ Pickup:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Fees:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Direct to Principal:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Contract Payment:</label>
                        <CurrencyInput value={0} />
                    </div>
                </div>
            </div>

            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Audit Information</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Cash Drawer</label>
                        <Dropdown id='cashDrawer' options={cashDrawers} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payment Taken By:</label>
                        <InputText />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Payment Notes:</label>
                        <InputText />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Amount Tendered:</label>
                        <InputText />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Change:</label>
                        <InputText />
                    </div>
                </div>

                <div className='take-payment__card mt-3'>
                    <h3 className='take-payment__title'>Payment Distribution</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down/ Pickup Pmt:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Fees:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--opacity'>
                        <label className='take-payment__label'>Principal:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--opacity'>
                        <label className='take-payment__label'>Additional Principal:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--opacity'>
                        <label className='take-payment__label'>Interest:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Taxes Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Total Paid:</label>
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

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>New Acct Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>New Down Pmt Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>New Fees Added:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>New Fees Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>New Total Balance:</label>
                        <span className='take-payment__value'>$ 0.00</span>
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
