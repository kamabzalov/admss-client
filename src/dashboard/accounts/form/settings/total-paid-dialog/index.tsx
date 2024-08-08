import { DashboardDialog, DashboardDialogProps } from "dashboard/common/dialog";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";

interface TotalPaidDialogProps extends DashboardDialogProps {}

export const TotalPaidDialog = ({ onHide, action, visible }: TotalPaidDialogProps) => {
    return (
        <DashboardDialog
            className='dialog__total-paid total-paid'
            footer='Save'
            header='Total Paid'
            visible={visible}
            onHide={onHide}
            cancelButton
        >
            <div className='splitter my-3'>
                <h3 className='splitter__title m-0'>Original Amount</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='total-paid__info'>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Principal Paid:</label>
                    <span className='total-paid__value'>$ 0.00</span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Interest Paid:</label>
                    <span className='total-paid__value'>$ 0.00</span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Extra Principal Payments:</label>
                    <span className='total-paid__value'>$ 0.00</span>
                </div>
                <div className='total-paid__item'>
                    <label className='total-paid__label'>Total Paid:</label>
                    <span className='total-paid__value'>$ 0.00</span>
                </div>
            </div>

            <div className='splitter my-3'>
                <h3 className='splitter__title m-0'>New Amounts</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='total-paid__control'>
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
                <CurrencyInput className='total-paid__input' title='Amount' labelPosition='top' />
            </div>

            <div className='total-paid__item'>
                <label className='total-paid__label'>Total Paid:</label>
                <span className='total-paid__value'>$ 0.00</span>
            </div>

            <Button
                className='total-paid__button'
                label='Calculate from Payment History'
                outlined
            />
        </DashboardDialog>
    );
};
