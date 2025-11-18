import { PermissionKey } from "common/constants/permissions";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

const otherPermissions: readonly PermissionKey[] = ["uaAllowReports", "uaAllowPrinting"];

export const RolesOther = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = otherPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(otherPermissions);
    };

    return (
        <section className='grid roles-other'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Allow Mobile' checked disabled />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Allow Printing'
                    checked={hasRolePermission("uaAllowPrinting")}
                    onChange={() => togglePermission("uaAllowPrinting")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Allow Web' checked disabled />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='View Deleted' checked disabled />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Undelete Deleted' checked disabled />
            </div>
        </section>
    );
});
