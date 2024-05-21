import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, DataTableSelectionMultipleChangeEvent } from "primereact/datatable";
import { ReactElement, useEffect, useRef, useState } from "react";
import { useStore } from "store/hooks";
import "./index.css";
import { useParams } from "react-router";
import { Loader } from "dashboard/common/loader";
import { getDealPrintFormTemplate } from "http/services/deals.service";
import { DealPrintForm } from "common/models/deals";

export const PrintDealForms = observer((): ReactElement => {
    const ref = useRef(null);
    const { id } = useParams();
    const store = useStore().dealStore;
    const { printList, getPrintList, isLoading } = store;

    const [selectedPrints, setSelectedPrints] = useState<DealPrintForm[] | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            getPrintList(id);
        }
    }, [getPrintList, id]);

    useEffect(() => {
        if (!selectedPrints?.length) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    }, [selectedPrints]);

    const handlePrintForm = async (templateuid: string, print: boolean = false) => {
        if (id) {
            try {
                store.isLoading = true;
                const response = await getDealPrintFormTemplate(id, templateuid);
                if (!response) {
                    throw new Error("Server not responding");
                }
                setIsButtonDisabled(true);
                setTimeout(() => {
                    const url = new Blob([response], { type: "application/pdf" });
                    let link = document.createElement("a");
                    link.href = window.URL.createObjectURL(url);
                    if (!print) {
                        link.download = `deal_print_form_${templateuid}.pdf`;
                        link.click();
                    } else {
                        window.open(
                            link.href,
                            "_blank",
                            "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                        );
                    }
                }, 3000);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                //TODO: handle error
            } finally {
                store.isLoading = false;
                setIsButtonDisabled(false);
            }
        }
    };

    const handlePrintSelectedForms = async (print: boolean = false) => {
        if (selectedPrints) {
            for (const { itemuid } of selectedPrints) {
                await handlePrintForm(itemuid, print);
            }
        }
    };

    const ActionButton = (rowData: DealPrintForm): ReactElement => {
        return (
            <div className='flex gap-3'>
                <Button
                    className='p-button deal-print__action-button'
                    outlined
                    disabled={isButtonDisabled}
                    onClick={() => handlePrintForm(rowData.itemuid, true)}
                >
                    Print
                </Button>
                <Button
                    className='p-button deal-print__action-button'
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
        <div className='grid deal-print row-gap-2'>
            {isLoading && <Loader overlay />}
            <div className='col-12'>
                <DataTable
                    className='mt-6 deal-print__table'
                    ref={ref}
                    value={printList}
                    emptyMessage='No exports yet.'
                    selectionMode={"checkbox"}
                    selection={selectedPrints!}
                    onSelectionChange={(
                        event: DataTableSelectionMultipleChangeEvent<DealPrintForm[]>
                    ) => setSelectedPrints(event.value)}
                    dataKey='itemuid'
                >
                    <Column selectionMode='multiple' headerStyle={{ width: "3rem" }} />
                    <Column field='name' header='Form' />
                    <Column body={ActionButton} className='deal-print__table-action' />
                </DataTable>
                <div className='deal-print__control'>
                    <Button
                        className='p-button deal-print__button'
                        onClick={() => handlePrintSelectedForms(true)}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        disabled={isButtonDisabled}
                    >
                        Print
                    </Button>
                    <Button
                        className='p-button deal-print__button'
                        onClick={() => handlePrintSelectedForms()}
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                    >
                        Download
                    </Button>
                    <Button
                        className='p-button deal-print__button'
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
