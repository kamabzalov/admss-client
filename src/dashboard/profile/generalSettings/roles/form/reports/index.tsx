import { PermissionKey } from "common/constants/permissions";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

const reportsPermissions: readonly PermissionKey[] = ["uaAllowReports"];

export const RolesReports = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = reportsPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(reportsPermissions);
    };

    return (
        <section className='grid roles-reports'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Allow Reports'
                    checked={hasRolePermission("uaAllowReports")}
                    onChange={() => togglePermission("uaAllowReports")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Create Reports' checked disabled />
            </div>
        </section>
    );
});
