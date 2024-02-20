import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";

export const ExportWebLinks = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventoryExportWeb } = store;
    return (
        <div className='grid export-web-links row-gap-2'>
            <InputTextarea
                placeholder='VDP Link (Vehicle Detail Page)'
                value={inventoryExportWeb.VDPLink}
                className='w-full export-web-links__text-area'
            />

            <hr className='form-line' />

            <InputTextarea
                placeholder='Video URL'
                value={inventoryExportWeb.VideoURL}
                className='w-full export-web-links__text-area'
            />
            <InputTextarea
                placeholder='Photo URL'
                value={inventoryExportWeb.PhotoURL}
                className='w-full export-web-links__text-area'
            />
        </div>
    );
});
