import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableSelectionMultipleChangeEvent } from "primereact/datatable";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useStore } from "store/hooks";
import "./index.css";
import { getInventoryPrintFormTemplate } from "http/services/inventory-service";
import { useParams } from "react-router";
import { InventoryPrintForm } from "common/models/inventory";

export const PrintForms = observer((): ReactElement => {
    const ref = useRef(null);
    const { id } = useParams();
    const store = useStore().inventoryStore;
    const { printList, getPrintList } = store;

    const [selectedPrints, setSelectedPrints] = useState<InventoryPrintForm[] | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            getPrintList(id);
        }
    }, [getPrintList, id]);

    const handlePrintForm = async (templateuid: string, print: boolean = false) => {
        if (id) {
            try {
                const response = await getInventoryPrintFormTemplate(id, templateuid);
                setIsButtonDisabled(true);
                setTimeout(() => {
                    const url = new Blob([response], { type: "application/pdf" });
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(url);
                    link.download = `print_form_${templateuid}.pdf`;
                    link.click();
                    if (print) {
                        window.open(
                            link.href,
                            "_blank",
                            "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                        );
                    }
                }, 3000);
            } catch (error) {
                //TODO: handle error
            } finally {
                setIsButtonDisabled(false);
            }
        }
    };

    const handlePrintSelectedForms = async () => {
        if (selectedPrints) {
            for (const { itemuid } of selectedPrints) {
                await handlePrintForm(itemuid);
            }
        }
    };

    const ActionButton = (rowData: InventoryPrintForm): ReactElement => {
        return (
            <div className='flex gap-3'>
                <Button
                    className='p-button inventory-print__action-button'
                    outlined
                    disabled={isButtonDisabled}
                    onClick={() => handlePrintForm(rowData.itemuid, true)}
                >
                    Print
                </Button>
                <Button
                    className='p-button inventory-print__action-button'
                    outlined
                    disabled={isButtonDisabled}
                    onClick={() => handlePrintForm(rowData.itemuid)}
                >
                    Download
                </Button>
            </div>
        );
    };

    return (
        <div className='grid inventory-print row-gap-2'>
            <div className='col-12'>
                <DataTable
                    className='mt-6 inventory-print__table'
                    ref={ref}
                    value={printList}
                    emptyMessage='No exports yet.'
                    selectionMode={"checkbox"}
                    selection={selectedPrints!}
                    onSelectionChange={(
                        event: DataTableSelectionMultipleChangeEvent<InventoryPrintForm[]>
                    ) => setSelectedPrints(event.value)}
                    dataKey='itemuid'
                >
                    <Column selectionMode='multiple' headerStyle={{ width: "3rem" }}></Column>
                    <Column field='name' header='Form' />
                    <Column body={ActionButton} className='inventory-print__table-action' />
                </DataTable>
                <div className='mt-4'>
                    <Button
                        className='p-button inventory-print__button'
                        onClick={handlePrintSelectedForms}
                        disabled={isButtonDisabled}
                    >
                        Print Selected
                    </Button>
                    <Button
                        className='p-button inventory-print__button ml-4'
                        outlined
                        onClick={() => setSelectedPrints(null)}
                    >
                        Clear all
                    </Button>
                </div>
            </div>
        </div>
    );
});
