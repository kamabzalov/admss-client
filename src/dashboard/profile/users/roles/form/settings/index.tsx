import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement, useState } from "react";
import { CheckboxChangeEvent } from "primereact/checkbox";

export const RolesSettings = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [createUsers, setCreateUsers] = useState<boolean>(false);
    const [editSettings, setEditSettings] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setCreateUsers(event.checked ?? false);
        setEditSettings(event.checked ?? false);
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
                    checked={createUsers}
                    onChange={() => setCreateUsers(!createUsers)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Edit Settings'
                    checked={editSettings}
                    onChange={() => setEditSettings(!editSettings)}
                />
            </div>
        </section>
    );
});
