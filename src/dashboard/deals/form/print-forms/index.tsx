import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import "./index.css";
import { useParams } from "react-router";
import { Loader } from "dashboard/common/loader";
import { getDealPrintFormTemplate } from "http/services/deals.service";
import { DealPrintForm } from "common/models/deals";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Checkbox } from "primereact/checkbox";

export const PrintDealForms = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().dealStore;
    const { printList, getPrintList, isLoading } = store;

    const [selectedPrints, setSelectedPrints] = useState<any[] | null>(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

    useEffect(() => {
        if (id) {
            getPrintList(id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                    store.isLoading = false;
                }, 3000);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
                //TODO: handle error
            } finally {
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

    const DealPrintItem = ({ item }: { item: DealPrintForm }): ReactElement => {
        const isItemSelected = selectedPrints?.some(
            (selectedItem) => selectedItem.itemuid === item.itemuid
        );
        return (
            <div
                className={`deal-print__list-item ${
                    isItemSelected ? "deal-print__list-item--selected" : ""
                }`}
            >
                <Checkbox
                    className='deal-print__checkbox'
                    checked={isItemSelected || false}
                    onChange={() => {
                        if (
                            selectedPrints?.some(
                                (selectedItem) => selectedItem.itemuid === item.itemuid
                            )
                        ) {
                            setSelectedPrints(
                                selectedPrints?.filter(
                                    (selectedItem) => selectedItem.itemuid !== item.itemuid
                                )
                            );
                        } else {
                            setSelectedPrints([...(selectedPrints || []), item]);
                        }
                    }}
                />
                <p>{item.name}</p>
                <div className='flex gap-3 ml-auto'>
                    <Button
                        className='p-button deal-print__action-button'
                        outlined
                        onClick={() => handlePrintForm(item.itemuid, true)}
                    >
                        Print
                    </Button>
                    <Button
                        className='p-button deal-print__action-button'
                        outlined
                        onClick={() => handlePrintForm(item.itemuid)}
                    >
                        Download
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className='grid deal-print row-gap-2'>
            {isLoading && <Loader overlay />}
            <div className='col-12'>
                <div className='deal-print__header'>
                    <Checkbox
                        className='deal-print__checkbox'
                        checked={selectedPrints?.length === Object.values(printList).flat().length}
                        onChange={() => {
                            if (selectedPrints?.length === Object.values(printList).flat().length) {
                                setSelectedPrints([]);
                            } else {
                                setSelectedPrints(Object.values(printList).flat());
                            }
                        }}
                    />
                    Form
                </div>
                <Accordion multiple activeIndex={[0]} className='deal-print__accordion'>
                    {Object.entries(printList).map(([group, prints]) => {
                        return (
                            <AccordionTab
                                key={group}
                                header={group}
                                className='deal-print__accordion-tab'
                            >
                                {prints.map((print) => (
                                    <DealPrintItem key={print.itemuid} item={print} />
                                ))}
                            </AccordionTab>
                        );
                    })}
                </Accordion>
                <div className='deal-print__control'>
                    <Button
                        className='p-button deal-print__button'
                        onClick={() => handlePrintSelectedForms(true)}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        disabled={isButtonDisabled}
                        type='button'
                    >
                        Print
                    </Button>
                    <Button
                        className='p-button deal-print__button'
                        onClick={() => handlePrintSelectedForms()}
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        type='button'
                    >
                        Download
                    </Button>
                    <Button
                        className='p-button deal-print__button'
                        outlined
                        onClick={() => setSelectedPrints(null)}
                        type='button'
                    >
                        Clear all
                    </Button>
                </div>
            </div>
        </div>
    );
});
