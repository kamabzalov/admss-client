import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { CheckboxChangeEvent } from "primereact/checkbox";
import { ReactElement, useState } from "react";

export const RolesOther = observer((): ReactElement => {
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [allowMobile, setAllowMobile] = useState<boolean>(false);
    const [allowPrinting, setAllowPrinting] = useState<boolean>(false);
    const [allowWeb, setAllowWeb] = useState<boolean>(false);
    const [viewDeleted, setViewDeleted] = useState<boolean>(false);
    const [undeleteDeleted, setUndeleteDeleted] = useState<boolean>(false);

    const handleSelectAllChange = (event: CheckboxChangeEvent) => {
        setSelectAll(event.checked ?? false);
        setAllowMobile(event.checked ?? false);
        setAllowPrinting(event.checked ?? false);
        setAllowWeb(event.checked ?? false);
        setViewDeleted(event.checked ?? false);
        setUndeleteDeleted(event.checked ?? false);
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
                <BorderedCheckbox
                    name='Allow Mobile'
                    checked={allowMobile}
                    onChange={() => setAllowMobile(!allowMobile)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Allow Printing'
                    checked={allowPrinting}
                    onChange={() => setAllowPrinting(!allowPrinting)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Allow Web'
                    checked={allowWeb}
                    onChange={() => setAllowWeb(!allowWeb)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='View Deleted'
                    checked={viewDeleted}
                    onChange={() => setViewDeleted(!viewDeleted)}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Undelete Deleted'
                    checked={undeleteDeleted}
                    onChange={() => setUndeleteDeleted(!undeleteDeleted)}
                />
            </div>
        </section>
    );
});
