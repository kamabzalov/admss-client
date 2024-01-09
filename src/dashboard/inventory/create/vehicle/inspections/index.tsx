import { ReactElement } from "react";
import { Calendar } from "primereact/calendar";
import "./index.css";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";

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
                <div className='p-inputgroup flex-1 w-full '>
                    <Calendar placeholder='Date' className='vehicle-inspections__calendar' />
                    <span className='p-inputgroup-addon'>
                        <i className='adms-support-history' />
                    </span>
                </div>
            </div>
            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full align-items-center justify-content-between vehicle-inspections__checkbox'>
                    <label>Emissions Check</label>
                    <span className='p-inputgroup-addon'>
                        <Checkbox checked={false} />
                    </span>
                </div>
            </div>

            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full align-items-center justify-content-between vehicle-inspections__checkbox'>
                    <label>Safety Check</label>
                    <span className='p-inputgroup-addon'>
                        <Checkbox checked={false} />
                    </span>
                </div>
            </div>
            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full'>
                    <Calendar
                        placeholder='Sticker Exp. Date'
                        className='vehicle-inspections__calendar'
                    />
                    <span className='p-inputgroup-addon'>
                        <i className='adms-support-history' />
                    </span>
                </div>
            </div>
        </div>
    );
};
