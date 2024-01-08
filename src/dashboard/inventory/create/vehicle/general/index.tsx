import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import "./index.css";

export const VehicleGeneral = (): JSX.Element => (
    <div className='grid vehicle-general row-gap-2'>
        <div className='col-6'>
            <span className='p-float-label'>
                <InputText className='vehicle-general__text-input w-full' />
                <label className='float-label'>VIN (required)</label>
            </span>
        </div>

        <div className='col-6'>
            <span className='p-float-label'>
                <InputText className='vehicle-general__text-input w-full' />
                <label className='float-label'>Stock#</label>
            </span>
        </div>
        <div className='col-6'>
            <Dropdown
                optionLabel='name'
                placeholder='Make (required)'
                className='w-full vehicle-general__dropdown'
            />
        </div>

        <div className='col-6'>
            <Dropdown
                optionLabel='name'
                placeholder='Model (required)'
                className='w-full vehicle-general__dropdown'
            />
        </div>
        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='vehicle-general__text-input w-full' />
                <label className='float-label'>Year (required)</label>
            </span>
        </div>

        <div className='col-3'>
            <span className='p-float-label'>
                <InputText className='vehicle-general__text-input w-full' />
                <label className='float-label'>Mileage (required)</label>
            </span>
        </div>
        <div className='col-3'>
            <Dropdown
                optionLabel='name'
                placeholder='Color'
                className='w-full vehicle-general__dropdown'
            />
        </div>

        <div className='col-3'>
            <Dropdown
                optionLabel='name'
                placeholder='Interior color'
                className='w-full vehicle-general__dropdown'
            />
        </div>
    </div>
);
