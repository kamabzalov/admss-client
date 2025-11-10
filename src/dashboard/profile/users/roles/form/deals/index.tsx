import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesDeals = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [addCreditAndFees, setAddCreditAndFees] = useState<boolean>(false);
    const [addDeals, setAddDeals] = useState<boolean>(false);
    const [addExpenses, setAddExpenses] = useState<boolean>(false);
    const [editDealWashout, setEditDealWashout] = useState<boolean>(false);
    const [editDeals, setEditDeals] = useState<boolean>(false);
    const [printDealsForms, setPrintDealsForms] = useState<boolean>(false);
    const [viewDeals, setViewDeals] = useState<boolean>(false);
    const [viewCostsAndExpenses, setViewCostsAndExpenses] = useState<boolean>(false);
    const [deleteDeal, setDeleteDeal] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setAddCreditAndFees(event.checked ?? false);
        setAddDeals(event.checked ?? false);
        setAddExpenses(event.checked ?? false);
        setEditDealWashout(event.checked ?? false);
        setEditDeals(event.checked ?? false);
        setPrintDealsForms(event.checked ?? false);
        setViewDeals(event.checked ?? false);
        setViewCostsAndExpenses(event.checked ?? false);
        setDeleteDeal(event.checked ?? false);
    };

    return (
        <section className='grid roles-deals'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Add Credit and Fees'
                    checked={addCreditAndFees}
                    onChange={() => setAddCreditAndFees(!addCreditAndFees)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Deals'
                    checked={addDeals}
                    onChange={() => setAddDeals(!addDeals)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Expenses'
                    checked={addExpenses}
                    onChange={() => setAddExpenses(!addExpenses)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Deal Washout'
                    checked={editDealWashout}
                    onChange={() => setEditDealWashout(!editDealWashout)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Deals'
                    checked={editDeals}
                    onChange={() => setEditDeals(!editDeals)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Print Deals Forms'
                    checked={printDealsForms}
                    onChange={() => setPrintDealsForms(!printDealsForms)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Deals'
                    checked={viewDeals}
                    onChange={() => setViewDeals(!viewDeals)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='View Costs and Expenses'
                    checked={viewCostsAndExpenses}
                    onChange={() => setViewCostsAndExpenses(!viewCostsAndExpenses)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Deal'
                    checked={deleteDeal}
                    onChange={() => setDeleteDeal(!deleteDeal)}
                />
            </div>
        </section>
    );
});
