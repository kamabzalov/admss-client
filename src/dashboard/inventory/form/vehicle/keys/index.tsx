import { ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const VehicleKeys = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventory } = store;
    return (
        <div className='grid vehicle-keys row-gap-2'>
            <div className='col-3'>
                <BorderedCheckbox name='Keys missing' checked={!!inventory.extdata.keysMissing} />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Duplicate Keys'
                    checked={!!inventory.extdata.keysDuplicate}
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Has Remote' checked={!!inventory.extdata.keysHasRemote} />
            </div>

            <div className='col-6'>
                <InputText
                    placeholder='Key number/ Location'
                    value={inventory.extdata.keyNumber}
                    className='w-full vehicle-keys__dropdown'
                />
            </div>
        </div>
    );
});
