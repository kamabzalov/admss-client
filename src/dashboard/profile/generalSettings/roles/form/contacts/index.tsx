import { PermissionKey } from "common/constants/permissions";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

const contactsPermissions: readonly PermissionKey[] = [
    "uaAddContacts",
    "uaEditContacts",
    "uaViewContacts",
    "uaDeleteContacts",
];

export const RolesContacts = observer((): ReactElement => {
    const { togglePermission, hasRolePermission, togglePermissionsGroup } = useStore().usersStore;

    const selectAll = contactsPermissions.every((permission) => hasRolePermission(permission));

    const handleSelectAllChange = () => {
        togglePermissionsGroup(contactsPermissions);
    };

    return (
        <section className='grid roles-contacts'>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Select All'
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Add Contacts'
                    checked={hasRolePermission("uaAddContacts")}
                    onChange={() => togglePermission("uaAddContacts")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Contacts'
                    checked={hasRolePermission("uaEditContacts")}
                    onChange={() => togglePermission("uaEditContacts")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Contacts'
                    checked={hasRolePermission("uaViewContacts")}
                    onChange={() => togglePermission("uaViewContacts")}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Contacts'
                    checked={hasRolePermission("uaDeleteContacts")}
                    onChange={() => togglePermission("uaDeleteContacts")}
                />
            </div>
        </section>
    );
});
