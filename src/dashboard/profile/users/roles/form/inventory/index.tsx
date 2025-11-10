import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesInventory = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [addInventory, setAddInventory] = useState<boolean>(false);
    const [editInventory, setEditInventory] = useState<boolean>(false);
    const [viewInventory, setViewInventory] = useState<boolean>(false);
    const [deleteInventory, setDeleteInventory] = useState<boolean>(false);
    const [editExpenses, setEditExpenses] = useState<boolean>(false);
    const [editPayments, setEditPayments] = useState<boolean>(false);
    const [deletePayments, setDeletePayments] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setAddInventory(event.checked ?? false);
        setEditInventory(event.checked ?? false);
        setViewInventory(event.checked ?? false);
        setDeleteInventory(event.checked ?? false);
        setEditExpenses(event.checked ?? false);
        setEditPayments(event.checked ?? false);
        setDeletePayments(event.checked ?? false);
    };
    return (
        <section className='grid roles-inventory'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Inventory'
                    checked={addInventory}
                    onChange={() => setAddInventory(!addInventory)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Inventory'
                    checked={editInventory}
                    onChange={() => setEditInventory(!editInventory)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Inventory'
                    checked={viewInventory}
                    onChange={() => setViewInventory(!viewInventory)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Inventory'
                    checked={deleteInventory}
                    onChange={() => setDeleteInventory(!deleteInventory)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Expenses'
                    checked={editExpenses}
                    onChange={() => setEditExpenses(!editExpenses)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Payments'
                    checked={editPayments}
                    onChange={() => setEditPayments(!editPayments)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Payments'
                    checked={deletePayments}
                    onChange={() => setDeletePayments(!deletePayments)}
                />
            </div>
        </section>
    );
});
