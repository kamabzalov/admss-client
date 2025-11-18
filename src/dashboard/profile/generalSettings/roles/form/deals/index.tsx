import { PermissionKey } from "common/constants/permissions";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

const dealsPermissions: readonly PermissionKey[] = [
    "uaAddCreditsAndFees",
    "uaAddDeals",
    "uaAddExpenses",
    "uaEditDealWashout",
    "uaEditDeals",
    "uaPrintDealsForms",
    "uaViewDeals",
    "uaViewCostsAndExpenses",
    "uaDeleteDeal",
];

export const RolesDeals = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = dealsPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(dealsPermissions);
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
                    checked={hasRolePermission("uaAddCreditsAndFees")}
                    onChange={() => togglePermission("uaAddCreditsAndFees")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Deals'
                    checked={hasRolePermission("uaAddDeals")}
                    onChange={() => togglePermission("uaAddDeals")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Expenses'
                    checked={hasRolePermission("uaAddExpenses")}
                    onChange={() => togglePermission("uaAddExpenses")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Deal Washout'
                    checked={hasRolePermission("uaEditDealWashout")}
                    onChange={() => togglePermission("uaEditDealWashout")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Deals'
                    checked={hasRolePermission("uaEditDeals")}
                    onChange={() => togglePermission("uaEditDeals")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Print Deals Forms'
                    checked={hasRolePermission("uaPrintDealsForms")}
                    onChange={() => togglePermission("uaPrintDealsForms")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Deals'
                    checked={hasRolePermission("uaViewDeals")}
                    onChange={() => togglePermission("uaViewDeals")}
                />
            </div>
            <div className='col-6'>
                <BorderedCheckbox
                    name='View Costs and Expenses'
                    checked={hasRolePermission("uaViewCostsAndExpenses")}
                    onChange={() => togglePermission("uaViewCostsAndExpenses")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Deal'
                    checked={hasRolePermission("uaDeleteDeal")}
                    onChange={() => togglePermission("uaDeleteDeal")}
                />
            </div>
        </section>
    );
});
