import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";

export const ExportWebFuel = observer((): ReactElement => {
    return (
        <div className='grid export-web-fuel row-gap-2'>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='export-web-fuel__text-input w-full' />
                    <label className='float-label'>City MPG</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='export-web-fuel__text-input w-full' />
                    <label className='float-label'>Hwy MPG</label>
                </span>
            </div>
        </div>
    );
});
