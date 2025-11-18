import { PermissionKey } from "common/constants/permissions";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

const accountsPermissions: readonly PermissionKey[] = [
    "uaViewAccounts",
    "uaAllowBackdatingPayments",
    "uaAllowPartialPayments",
    "uaAllowPaymentCalculator",
    "uaAllowPaymentQuote",
    "uaChangePayments",
    "uaDeleteAccounts",
    "uaEditInsuranceOnly",
    "uaEditPaidComissions",
];

export const RolesAccounts = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = accountsPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(accountsPermissions);
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
                    checked={hasRolePermission("uaViewAccounts")}
                    onChange={() => togglePermission("uaViewAccounts")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Back Dating Payments'
                    checked={hasRolePermission("uaAllowBackdatingPayments")}
                    onChange={() => togglePermission("uaAllowBackdatingPayments")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Partial Payments'
                    checked={hasRolePermission("uaAllowPartialPayments")}
                    onChange={() => togglePermission("uaAllowPartialPayments")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Payment Calculator'
                    checked={hasRolePermission("uaAllowPaymentCalculator")}
                    onChange={() => togglePermission("uaAllowPaymentCalculator")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Allow Payment Quote'
                    checked={hasRolePermission("uaAllowPaymentQuote")}
                    onChange={() => togglePermission("uaAllowPaymentQuote")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Change Payments'
                    checked={hasRolePermission("uaChangePayments")}
                    onChange={() => togglePermission("uaChangePayments")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Accounts'
                    checked={hasRolePermission("uaDeleteAccounts")}
                    onChange={() => togglePermission("uaDeleteAccounts")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Insurance Only'
                    checked={hasRolePermission("uaEditInsuranceOnly")}
                    onChange={() => togglePermission("uaEditInsuranceOnly")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='Edit Paid Commissions'
                    checked={hasRolePermission("uaEditPaidComissions")}
                    onChange={() => togglePermission("uaEditPaidComissions")}
                />
            </div>
        </section>
    );
});
