import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";

export const ExportWebExtra = observer((): ReactElement => {
    return (
        <div className='grid export-web-extra row-gap-2'>
            <InputTextarea
                placeholder='Extra field 1'
                className='w-full export-web-extra__text-area'
            />
            <InputTextarea
                placeholder='Extra field 2'
                className='w-full export-web-extra__text-area'
            />
            <InputTextarea
                placeholder='Extra field 3'
                className='w-full export-web-extra__text-area'
            />
        </div>
    );
});
