/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InventoryVehicleData } from "./vehicle";
import { Button } from "primereact/button";
import { InventoryItem, InventorySection } from "../common";
import { InventoryPurchaseData } from "./purchase";
import { InventoryMediaData } from "./mediaData";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { ProgressBar } from "primereact/progressbar";

export const inventorySections = [
    InventoryVehicleData,
    InventoryPurchaseData,
    InventoryMediaData,
].map((sectionData) => new InventorySection(sectionData));

export const InventoryForm = () => {
    const { id } = useParams();
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(0);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);

    const store = useStore().inventoryStore;
    const { getInventory, getInventoryMedia, clearInventory, saveInventory } = store;
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            getInventory(id);
            getInventoryMedia(id);
        } else {
            clearInventory();
        }
        return () => {
            clearInventory();
        };
    }, [id, store]);

    const accordionSteps = inventorySections.map((item) => item.startIndex);
    const itemsMenuCount = inventorySections.reduce(
        (acc, current) => acc + current.getLength(),
        -1
    );

    useEffect(() => {
        accordionSteps.forEach((step, index) => {
            if (step - 1 < stepActiveIndex) {
                return setAccordionActiveIndex((prev) => {
                    const updatedArray = Array.isArray(prev) ? [...prev] : [0];
                    updatedArray[index] = index;
                    return updatedArray;
                });
            }
        });
    }, [stepActiveIndex]);

    const handleSave = () => {
        saveInventory().then((res) => {
            //TODO: add actions after saving
            if (res && !id) {
                navigate(`/dashboard/inventory/${res}`);
            }
        });
    };

    return (
        <Suspense>
            <div className='grid'>
                <div className='col-12'>
                    <div className='card inventory'>
                        <div className='card-header'>
                            <h2 className='card-header__title uppercase m-0'>
                                {id ? "Edit" : "Create new"} inventory
                            </h2>
                        </div>
                        <div className='card-content inventory__card'>
                            <div className='grid flex-nowrap'>
                                <div className='p-0'>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        className='inventory__accordion'
                                        multiple
                                    >
                                        {inventorySections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={section.label}
                                            >
                                                <Steps
                                                    model={section.items.map(
                                                        ({ itemLabel, template }) => ({
                                                            label: itemLabel,
                                                            template,
                                                        })
                                                    )}
                                                    readOnly={false}
                                                    activeIndex={
                                                        stepActiveIndex - section.startIndex
                                                    }
                                                    onSelect={(e) =>
                                                        setStepActiveIndex(
                                                            e.index + section.startIndex
                                                        )
                                                    }
                                                    className='vertical-step-menu'
                                                    pt={{
                                                        menu: { className: "flex-column w-full" },
                                                        step: {
                                                            className:
                                                                "border-circle inventory-step",
                                                        },
                                                    }}
                                                />
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                </div>
                                <div className='w-full flex flex-column p-0'>
                                    <div className='flex flex-grow-1'>
                                        {inventorySections.map((section) =>
                                            section.items.map((item: InventoryItem) => (
                                                <div
                                                    key={item.itemIndex}
                                                    className={`${
                                                        stepActiveIndex === item.itemIndex
                                                            ? "block inventory-form"
                                                            : "hidden"
                                                    }`}
                                                >
                                                    <div className='inventory-form__title uppercase'>
                                                        {item.itemLabel}
                                                    </div>
                                                    {stepActiveIndex === item.itemIndex && (
                                                        <Suspense
                                                            fallback={
                                                                <ProgressBar
                                                                    mode='indeterminate'
                                                                    style={{ height: "8px" }}
                                                                    color='var(--admss-app-main-blue)'
                                                                />
                                                            }
                                                        >
                                                            {item.component}
                                                        </Suspense>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-content-end gap-3 mt-5 mr-3'>
                                <Button
                                    onClick={() => setStepActiveIndex((prev) => --prev)}
                                    disabled={!stepActiveIndex}
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStepActiveIndex((prev) => ++prev)}
                                    disabled={stepActiveIndex >= itemsMenuCount}
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button onClick={handleSave} className='uppercase px-6'>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
};
