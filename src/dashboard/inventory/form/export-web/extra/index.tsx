import { observer } from "mobx-react-lite";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";

export const ExportWebExtra = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventoryExportWeb } = store;
    return (
        <div className='grid export-web-extra row-gap-2'>
            <InputTextarea
                placeholder='Extra field 1'
                value={inventoryExportWeb.ExtraField1}
                className='w-full export-web-extra__text-area'
            />
            <InputTextarea
                placeholder='Extra field 2'
                value={inventoryExportWeb.ExtraField2}
                className='w-full export-web-extra__text-area'
            />
            <InputTextarea
                placeholder='Extra field 3'
                value={inventoryExportWeb.ExtraField3}
                className='w-full export-web-extra__text-area'
            />
        </div>
    );
});
