import { BorderedCheckbox, CurrencyInput } from "dashboard/common/form/inputs";
import { ReactElement, useEffect } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { useParams } from "react-router-dom";

export const PurchasePayments = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        inventoryExtData: { payExpenses, payPack, payPaid, paySalesTaxPaid },
        changeInventoryExtData,
        saveInventory,
        getInventoryPayments,
    } = store;
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getInventoryPayments(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
        { field: "Date", header: "Date" },
        { field: "Type", header: "Type" },
        { field: "Amount", header: "Amount" },
        { field: "NotBillable", header: "Not Billable" },
        { field: "Vendor", header: "Vendor" },
    ];
    return (
        <>
            <div className='grid purchase-payments row-gap-2'>
                <div className='col-3'>
                    <CurrencyInput
                        labelPosition='top'
                        title='Pack for this Vehicle'
                        value={payPack}
                        onChange={({ value }) => {
                            changeInventoryExtData({
                                key: "payPack",
                                value: Number(value),
                            });
                        }}
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        checked={!!payExpenses}
                        onChange={() =>
                            changeInventoryExtData({
                                key: "payExpenses",
                                value: !!payExpenses ? 0 : 1,
                            })
                        }
                        name='Default Expenses'
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        checked={!!payPaid}
                        onChange={() =>
                            changeInventoryExtData({
                                key: "payPaid",
                                value: !!payPaid ? 0 : 1,
                            })
                        }
                        name='Paid'
                    />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox
                        checked={!!paySalesTaxPaid}
                        onChange={() =>
                            changeInventoryExtData({
                                key: "paySalesTaxPaid",
                                value: !!paySalesTaxPaid ? 0 : 1,
                            })
                        }
                        name='Sales Tax Paid'
                    />
                </div>

                <div className='col-12'>
                    <InputTextarea
                        className='purchase-payments__text-area'
                        placeholder='Description'
                        //TODO: missed payment description data
                    />
                </div>

                <Button className='purchase-payments__button' onClick={saveInventory}>
                    Save
                </Button>
            </div>
            <div className='grid'>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='mt-6 purchase-payments__table'
                        value={[]}
                        emptyMessage='No expenses yet.'
                        reorderableColumns
                        resizableColumns
                    >
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                headerClassName='cursor-move'
                            />
                        ))}
                    </DataTable>
                </div>
                <div className='total-sum'>
                    <span className='total-sum__label'>Total expenses:</span>
                    <span className='total-sum__value'> $ 0.00</span>
                </div>
            </div>
        </>
    );
});
