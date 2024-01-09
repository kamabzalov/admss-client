/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InventoryVehicleData } from "./vehicle";
import { Button } from "primereact/button";
import { InventoryItem, InventorySection } from "../common";
import { InventoryPurchaseData } from "./purchase";
import { InventoryMediaData } from "./mediaData";
import "./index.css";

export const inventorySections = [
    InventoryVehicleData,
    InventoryPurchaseData,
    InventoryMediaData,
].map((sectionData) => new InventorySection(sectionData));

export const CreateInventory = () => {
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(0);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [isValidData, setIsValidData] = useState<boolean>(false);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stepActiveIndex]);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card create-inventory'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Create new inventory</h2>
                    </div>
                    <div className='card-content create-inventory__card'>
                        <div className='grid'>
                            <div className='col-4 p-0'>
                                <Accordion
                                    activeIndex={accordionActiveIndex}
                                    onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                    className='create-inventory__accordion'
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
                                                activeIndex={stepActiveIndex - section.startIndex}
                                                onSelect={(e) =>
                                                    setStepActiveIndex(e.index + section.startIndex)
                                                }
                                                className='vertical-step-menu'
                                                pt={{
                                                    menu: { className: "flex-column w-full" },
                                                    step: {
                                                        className:
                                                            "border-circle create-inventory-step",
                                                    },
                                                }}
                                            />
                                        </AccordionTab>
                                    ))}
                                </Accordion>
                            </div>
                            <div className='col-8 flex flex-column p-0 '>
                                <div className='flex flex-grow-1'>
                                    {inventorySections.map((section) =>
                                        section.items.map((item: InventoryItem) => (
                                            <div
                                                key={item.itemIndex}
                                                className={`${
                                                    stepActiveIndex === item.itemIndex
                                                        ? "block new-inventory-form"
                                                        : "hidden"
                                                }`}
                                            >
                                                <div className='new-inventory-form__title uppercase'>
                                                    {item.itemLabel}
                                                </div>
                                                {item.component}
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
                                className='uppercase  px-6'
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
                            <Button
                                onClick={() => {}}
                                disabled={!isValidData}
                                className='uppercase px-6'
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
