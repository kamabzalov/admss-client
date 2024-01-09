import { ReactElement } from "react";
import "./index.css";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";

export const VehicleKeys = (): ReactElement => {
    return (
        <div className='grid vehicle-keys row-gap-2'>
            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full align-items-center justify-content-between vehicle-keys__checkbox'>
                    <label>Keys missing</label>
                    <span className='p-inputgroup-addon'>
                        <Checkbox checked={false} />
                    </span>
                </div>
            </div>
            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full align-items-center justify-content-between vehicle-keys__checkbox'>
                    <label>Duplicate Keys</label>
                    <span className='p-inputgroup-addon'>
                        <Checkbox checked={false} />
                    </span>
                </div>
            </div>
            <div className='col-3'>
                <div className='p-inputgroup flex-1 w-full align-items-center justify-content-between vehicle-keys__checkbox'>
                    <label>Has Remote</label>
                    <span className='p-inputgroup-addon'>
                        <Checkbox checked={false} />
                    </span>
                </div>
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
