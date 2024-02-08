import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";

export const ExportWebLinks = observer((): ReactElement => {
    return (
        <div className='grid export-web-links row-gap-2'>
            <InputTextarea
                placeholder='VDP Link (Vehicle Detail Page)'
                className='w-full export-web-links__text-area'
            />

            <hr className='form-line' />

            <InputTextarea placeholder='Video URL' className='w-full export-web-links__text-area' />
            <InputTextarea placeholder='Photo URL' className='w-full export-web-links__text-area' />
        </div>
    );
});
