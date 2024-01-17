import { ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { BorderedCheckbox, DateInput } from "dashboard/common/form/inputs";

export const VehicleInspections = (): ReactElement => {
    return (
        <div className='grid vehicle-inspections row-gap-2'>
            <div className='col-6'>
                <InputText
                    placeholder='Inspection Number'
                    className='w-full vehicle-inspections__dropdown'
                />
            </div>

            <div className='col-3'>
                <DateInput name='Date' />
            </div>
            <div className='col-3'>
                <BorderedCheckbox name='Emissions Check' checked={false} />
            </div>

            <div className='col-3'>
                <BorderedCheckbox name='Safety Check' checked={false} />
            </div>
            <div className='col-3'>
                <DateInput name='Sticker Exp. Date' />
            </div>
        </div>
    );
};
