import { ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { BorderedCheckbox } from "dashboard/common/form/inputs";

export const VehicleKeys = (): ReactElement => {
    return (
        <div className='grid vehicle-keys row-gap-2'>
            <div className='col-3'>
                <BorderedCheckbox name='Keys missing' checked={false} />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Duplicate Keys' checked={false} />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Has Remote' checked={false} />
            </div>

            <div className='col-6'>
                <InputText
                    placeholder='Key number/ Location'
                    className='w-full vehicle-keys__dropdown'
                />
            </div>
        </div>
    );
};
