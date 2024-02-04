import { BorderedCheckbox, CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { ReactElement } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";

export const PurchaseExpenses = (): ReactElement => (
    <>
        <div className='grid purchase-expenses'>
            <div className='col-6 grid row-gap-2'>
                <div className='col-6'>
                    <DateInput name='Date' />
                </div>
                <div className='col-6'>
                    <Dropdown placeholder='Type' filter className='w-full' />
                </div>
                <div className='col-12'>
                    <Dropdown placeholder='Vendor' filter className='w-full' />
                </div>
                <div className='col-6'>
                    <CurrencyInput labelPosition='top' title='Amount' />
                </div>
                <div className='col-6'>
                    <BorderedCheckbox checked={false} name='Not Billable' />
                </div>
            </div>
            <div className='col-6'>
                <InputTextarea className='purchase-expenses__text-area' placeholder='Notes' />
            </div>

            <Button className='purchase-expenses__button'>Save</Button>
        </div>
        <div className='grid'>
            <div className='col-12'>
                <DataTable
                    className='mt-6 purchase-expenses__table'
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
