import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { PermissionKey } from "common/constants/permissions";
import { useStore } from "store/hooks";

const settingsPermissions: readonly PermissionKey[] = ["uaCreateUsers", "uaEditSettings"];

export const RolesSettings = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = settingsPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(settingsPermissions);
    };

    return (
        <section className='grid roles-settings'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Create Users'
                    checked={hasRolePermission("uaCreateUsers")}
                    onChange={() => togglePermission("uaCreateUsers")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Settings'
                    checked={hasRolePermission("uaEditSettings")}
                    onChange={() => togglePermission("uaEditSettings")}
                />
            </div>
        </section>
    );
});
