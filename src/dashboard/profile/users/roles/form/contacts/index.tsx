import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesContacts = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [addContacts, setAddContacts] = useState<boolean>(false);
    const [editContacts, setEditContacts] = useState<boolean>(false);
    const [viewContacts, setViewContacts] = useState<boolean>(false);
    const [deleteContacts, setDeleteContacts] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setAddContacts(event.checked ?? false);
        setEditContacts(event.checked ?? false);
        setViewContacts(event.checked ?? false);
        setDeleteContacts(event.checked ?? false);
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
                    checked={addContacts}
                    onChange={() => setAddContacts(!addContacts)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Contacts'
                    checked={editContacts}
                    onChange={() => setEditContacts(!editContacts)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Contacts'
                    checked={viewContacts}
                    onChange={() => setViewContacts(!viewContacts)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Delete Contacts'
                    checked={deleteContacts}
                    onChange={() => setDeleteContacts(!deleteContacts)}
                />
            </div>
        </section>
    );
});
