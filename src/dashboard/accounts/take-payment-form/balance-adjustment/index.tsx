import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { DateInput, CurrencyInput } from "dashboard/common/form/inputs";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { TakePaymentInfo } from "dashboard/accounts/take-payment-form/take-payment-info";

const cashDrawers = [
    { label: "Drawer 1", value: "drawer1" },
    { label: "Drawer 2", value: "drawer2" },
];

export const AccountBalanceAdjustment = observer((): ReactElement => {
    return (
        <div className='grid balance-adjustment'>
            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Original Amounts</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Amount Financed:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Expected Interest:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Principal Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Interest Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Extra Principal Pmts:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Payment Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label'>Total Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label text-lg'>Current Balance:</label>
                        <span className='take-payment__value text-lg'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Next Payment Due:</label>
                        <span className='take-payment__value'>07/15/2024</span>
                    </div>
                </div>

                <div className='take-payment__card mt-3'>
                    <h3 className='take-payment__title'>New Amounts</h3>

                    <span className='p-float-label mt-2'>
                        <InputText id='adjustmentComment' className='balance-adjustment__input' />
                        <label htmlFor='adjustmentComment'>Adjustment Comment</label>
                    </span>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Principal Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Interest Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Extra Principal Pmts:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Payment Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label'>Total Paid:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label text-lg'>New Balance:</label>
                        <span className='take-payment__value text-lg'>$ 0.00</span>
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Next Payment Due:</label>
                        <span className='take-payment__value'>07/15/2024</span>
                    </div>
                </div>
            </div>

            <div className='col-12 md:col-4'>
                <div className='take-payment__card'>
                    <h3 className='take-payment__title'>Adjustments</h3>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Adjustment Type:</label>
                        <Dropdown id='cashDrawer' options={cashDrawers} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Adjustment Date:</label>
                        <DateInput className='take-payment__input' />
                    </div>

                    <hr className='form-line' />

                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Principal Adj:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Interest Adj:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Extra Principal Adj:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item'>
                        <label className='take-payment__label'>Down Pmt Adj:</label>
                        <CurrencyInput value={0} />
                    </div>
                    <div className='take-payment__item take-payment__item--bold'>
                        <label className='take-payment__label'>Total Adj:</label>
                        <span className='take-payment__value'>$ 0.00</span>
                    </div>
                </div>
            </div>

            <div className='col-12 md:col-4'>
                <TakePaymentInfo />
            </div>
        </div>
    );
});
