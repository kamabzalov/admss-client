import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";
import { Checkbox } from "primereact/checkbox";

export const VehicleDisclosures = (): ReactElement => {
    return (
        <div className='grid vehicle-disclosures row-gap-2'>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-excess'
                        name='disclosures-excess'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-excess' className='ml-2'>
                        Odometer reflects the milage in EXCESS of its limits
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-discrepancy'
                        name='disclosures-discrepancy'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-discrepancy' className='ml-2'>
                        Odometer is NOT the actual mileage - DISCREPANCY
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-salvage'
                        name='disclosures-salvage'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-salvage' className='ml-2'>
                        Vehicle is a Salvage Vehicle
                    </label>
                </div>
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    placeholder='State'
                    className='w-full vehicle-disclosures__dropdown'
                />
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-flood'
                        name='disclosures-flood'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-flood' className='ml-2'>
                        Vehicle is a Flood Vehicle
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-damage'
                        name='disclosures-damage'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-damage' className='ml-2'>
                        Vehicle suffered damage of at least 25%
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-recovered'
                        name='disclosures-recovered'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-recovered' className='ml-2'>
                        Vehicle is a Recovered Theft Vehicle
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-reconstructed'
                        name='disclosures-reconstructed'
                        className='mt-1'
                        onChange={() => {}}
                        checked={false}
                    />
                    <label htmlFor='disclosures-reconstructed' className='ml-2'>
                        Vehicle has been Reconstructed
                    </label>
                </div>
            </div>

            <div className='col-6'>
                <InputTextarea
                    placeholder='Parts Damaged'
                    className='w-full vehicle-disclosures__text-area'
                />
            </div>
            <div className='col-6'>
                <InputTextarea
                    placeholder='Theft Parts Damaged '
                    className='w-full vehicle-disclosures__text-area'
                />
            </div>
        </div>
    );
};
