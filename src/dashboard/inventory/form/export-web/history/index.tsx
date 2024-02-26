import { observer } from "mobx-react-lite";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ReactElement } from "react";
import "./index.css";
import { useStore } from "store/hooks";

export const ExportWebHistory = observer((): ReactElement => {
    const store = useStore().inventoryStore;

    const { inventoryExportWebHistory } = store;

    return (
        <div className='grid export-web-history row-gap-2'>
            <div className='col-12'>
                <DataTable
                    className='mt-6 export-web-history__table'
                    value={inventoryExportWebHistory}
                    emptyMessage='No exports yet.'
                >
                    <Column field='created' header='Date' />
                    <Column field='servicetype' header='Service' />
                    <Column field='listprice' header='List price' />
                    <Column field='taskstatus' header='Status' />
                </DataTable>
            </div>
        </div>
    );
});
