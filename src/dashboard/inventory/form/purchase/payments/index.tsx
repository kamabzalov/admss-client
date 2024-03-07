import { BorderedCheckbox, CurrencyInput } from "dashboard/common/form/inputs";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { getAccountPaymentsList, setAccountPayment } from "http/services/accounts.service";
import { AccountPayment } from "common/models/accounts";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountPayment;
}

type TableColumnsList = Pick<TableColumnProps, "header" | "field">;

export const PurchasePayments = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const [user, setUser] = useState<AuthUser | null>(null);
    const {
        inventoryExtData: { payExpenses, payPack, payPaid, paySalesTaxPaid },
        changeInventoryExtData,
        saveInventory,
        getInventoryPayments,
    } = store;

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user) {
            getInventoryPayments(user.useruid);
            getAccountPaymentsList(user.useruid);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const renderColumnsData: TableColumnsList[] = [
        { field: "ACCT_NUM", header: "Pack for this Vehicle" },
        { field: "Status", header: "Default Expenses" },
        { field: "Amount", header: "Paid" },
        { field: "PTPDate", header: "Sales Tax Paid" },
    ];

    const handleSavePayment = () => {
        saveInventory();
        setAccountPayment("0", {
            payExpenses,
            payPack,
            payPaid,
            paySalesTaxPaid,
        });
    };

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

                <Button className='purchase-payments__button' onClick={handleSavePayment}>
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
