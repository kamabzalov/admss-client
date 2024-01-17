import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";

export const VehicleOther = (): ReactElement => {
    return (
        <div className='grid vehicle-other row-gap-2'>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    placeholder='Status'
                    className='w-full vehicle-other__dropdown'
                />
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    placeholder='Location name'
                    className='w-full vehicle-other__dropdown'
                />
            </div>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    placeholder='Group class'
                    className='w-full vehicle-other__dropdown'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    placeholder='Category'
                    className='w-full vehicle-other__dropdown'
                />
            </div>

            <div className='col-12'>
                <InputTextarea placeholder='Notes' className='w-full vehicle-other__text-area' />
            </div>
        </div>
    );
};
