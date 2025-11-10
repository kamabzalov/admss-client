import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesAccounts = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [viewAccounts, setViewAccounts] = useState<boolean>(false);
    const [allowBackDatingPayments, setAllowBackDatingPayments] = useState<boolean>(false);
    const [allowPartialPayments, setAllowPartialPayments] = useState<boolean>(false);
    const [allowPaymentCalculator, setAllowPaymentCalculator] = useState<boolean>(false);
    const [allowPaymentQuote, setAllowPaymentQuote] = useState<boolean>(false);
    const [changePayments, setChangePayments] = useState<boolean>(false);
    const [deleteAccounts, setDeleteAccounts] = useState<boolean>(false);
    const [editInsuranceOnly, setEditInsuranceOnly] = useState<boolean>(false);
    const [editPaidCommissions, setEditPaidCommissions] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setViewAccounts(event.checked ?? false);
        setAllowBackDatingPayments(event.checked ?? false);
        setAllowPartialPayments(event.checked ?? false);
        setAllowPaymentCalculator(event.checked ?? false);
        setAllowPaymentQuote(event.checked ?? false);
        setChangePayments(event.checked ?? false);
        setDeleteAccounts(event.checked ?? false);
        setEditInsuranceOnly(event.checked ?? false);
        setEditPaidCommissions(event.checked ?? false);
    };
    return (
        <section className='grid roles-accounts'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Accounts'
                    checked={viewAccounts}
                    onChange={() => setViewAccounts(!viewAccounts)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Back Dating Payments'
                    checked={allowBackDatingPayments}
                    onChange={() => setAllowBackDatingPayments(!allowBackDatingPayments)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Partial Payments'
                    checked={allowPartialPayments}
                    onChange={() => setAllowPartialPayments(!allowPartialPayments)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Payment Calculator'
                    checked={allowPaymentCalculator}
                    onChange={() => setAllowPaymentCalculator(!allowPaymentCalculator)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Payment Quote'
                    checked={allowPaymentQuote}
                    onChange={() => setAllowPaymentQuote(!allowPaymentQuote)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Change Payments'
                    checked={changePayments}
                    onChange={() => setChangePayments(!changePayments)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Accounts'
                    checked={deleteAccounts}
                    onChange={() => setDeleteAccounts(!deleteAccounts)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Insurance Only'
                    checked={editInsuranceOnly}
                    onChange={() => setEditInsuranceOnly(!editInsuranceOnly)}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Edit Paid Commissions'
                    checked={editPaidCommissions}
                    onChange={() => setEditPaidCommissions(!editPaidCommissions)}
                />
            </div>
        </section>
    );
});
