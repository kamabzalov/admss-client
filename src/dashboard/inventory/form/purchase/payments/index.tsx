import { BorderedCheckbox, CurrencyInput } from "dashboard/common/form/inputs";
import { ReactElement } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

export const PurchasePayments = (): ReactElement => (
    <>
        <div className='grid purchase-payments row-gap-2'>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Pack for this Vehicle' />
            </div>
            <div className='col-3'>
                <BorderedCheckbox checked={false} name='Default Expenses' />
            </div>
            <div className='col-3'>
                <BorderedCheckbox checked={false} name='Paid' />
            </div>
            <div className='col-3'>
                <BorderedCheckbox checked={false} name='Sales Tax Paid' />
            </div>

            <div className='col-12'>
                <InputTextarea className='purchase-payments__text-area' placeholder='Description' />
            </div>

            <Button className='purchase-payments__button'>Save</Button>
        </div>
        <div className='grid'>
            <div className='col-12'>
                <DataTable
                    className='mt-6 purchase-payments__table'
                    value={[]}
                    emptyMessage='No expenses yet.'
                >
                    <Column header='Date' />
                    <Column header='Type' />
                    <Column header='Amount' />
                    <Column header='Not Billable' />
                    <Column header='Vendor' />
                </DataTable>
            </div>
            <div className='total-sum'>
                <span className='total-sum__label'>Total expenses:</span>
                <span className='total-sum__value'> $ 0.00</span>
            </div>
        </div>
    </>
);
