import { DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import { useStore } from "store/hooks";

export const ExportWebDates = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        inventoryExportWeb: { InStockDate, LastModifiedDate, LastExportDate },
    } = store;

    const stockDate = String(InStockDate);
    const lastModifiedDate = String(LastModifiedDate);
    const lastExportDate = String(LastExportDate);

    return (
        <div className='grid export-web-dates row-gap-2'>
            <div className='col-3'>
                <DateInput value={stockDate} name='In Stock Date' />
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <DateInput value={lastModifiedDate} name='Last Modified Date' />
            </div>
            <div className='col-3'>
                <DateInput value={lastExportDate} name='Last Export Date' />
            </div>
        </div>
    );
});
