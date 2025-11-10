import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesReports = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [allowReports, setAllowReports] = useState<boolean>(false);
    const [createReports, setCreateReports] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setAllowReports(event.checked ?? false);
        setCreateReports(event.checked ?? false);
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
                    checked={allowReports}
                    onChange={() => setAllowReports(!allowReports)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Create Reports'
                    checked={createReports}
                    onChange={() => setCreateReports(!createReports)}
                />
            </div>
        </section>
    );
});
