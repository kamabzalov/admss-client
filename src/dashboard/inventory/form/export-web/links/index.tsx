import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";

export const ExportWebLinks = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventoryExportWeb, changeExportWeb } = store;
    return (
        <div className='grid export-web-links row-gap-2'>
            <InputTextarea
                placeholder='VDP Link (Vehicle Detail Page)'
                value={inventoryExportWeb.VDPLink}
                onChange={({ target: { value } }) => changeExportWeb({ key: "VDPLink", value })}
                className='w-full export-web-links__text-area'
            />

            <hr className='form-line' />

            <InputTextarea
                placeholder='Video URL'
                value={inventoryExportWeb.VideoURL}
                onChange={({ target: { value } }) => changeExportWeb({ key: "VideoURL", value })}
                className='w-full export-web-links__text-area'
            />
            <InputTextarea
                placeholder='Photo URL'
                value={inventoryExportWeb.PhotoURL}
                onChange={({ target: { value } }) => changeExportWeb({ key: "PhotoURL", value })}
                className='w-full export-web-links__text-area'
            />
        </div>
    );
});
