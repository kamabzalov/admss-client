/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Deals, DealsItem, DealsSection } from "../common";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "primereact/progressbar";

import { useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { DealGeneralInfo } from "./general-info";
import { DealRetail } from "./retail";
import { useStore } from "store/hooks";

const STEP = "step";

export const DealsForm = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;

    const store = useStore().dealStore;
    const { getDeal } = store;

    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const stepsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [dealsSections, setDealsSections] = useState<DealsSection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);

    useEffect(() => {
        if (stepsRef.current) {
            const activeStep = stepsRef.current.querySelector("[aria-selected='true']");
            if (activeStep) {
                activeStep.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [stepActiveIndex, stepsRef.current]);

    const getUrl = (activeIndex: number) => {
        const currentPath = id ? id : "create";
        return `/dashboard/deals/${currentPath}?step=${activeIndex + 1}`;
    };

    useEffect(() => {
        const dealsSections: Pick<Deals, "label" | "items">[] = [DealGeneralInfo, DealRetail];
        const sections = dealsSections.map((sectionData) => new DealsSection(sectionData));
        setDealsSections(sections);
        setAccordionSteps(sections.map((item) => item.startIndex));
        const itemsMenuCount = sections.reduce((acc, current) => acc + current.getLength(), -1);
        setItemsMenuCount(itemsMenuCount);

        id && getDeal(id);
        return () => {
            sections.forEach((section) => section.clearCount());
        };
    }, [id]);

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

    return (
        <Suspense>
            <div className='grid relative'>
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={() => navigate("/dashboard/deals")}
                />
                <div className='col-12'>
                    <div className='card deal'>
                        <div className='card-header flex'>
                            <h2 className='card-header__title uppercase m-0'>
                                {id ? "Edit" : "Create new"} Deal
                            </h2>
                        </div>
                        <div className='card-content deal__card'>
                            <div className='grid flex-nowrap deal__card-content'>
                                <div className='p-0 card-content__wrapper' ref={stepsRef}>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        className='deal__accordion'
                                        multiple
                                    >
                                        {dealsSections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={section.label}
                                            >
                                                <Steps
                                                    readOnly={false}
                                                    activeIndex={
                                                        stepActiveIndex - section.startIndex
                                                    }
                                                    onSelect={(e) => {
                                                        setStepActiveIndex(
                                                            e.index + section.startIndex
                                                        );
                                                    }}
                                                    model={section.items.map(
                                                        (
                                                            { itemLabel, template }: any,
                                                            idx: number
                                                        ) => ({
                                                            label: itemLabel,
                                                            template,
                                                            command: () => {
                                                                navigate(
                                                                    getUrl(section.startIndex + idx)
                                                                );
                                                            },
                                                        })
                                                    )}
                                                    className='vertical-step-menu'
                                                    pt={{
                                                        menu: { className: "flex-column w-full" },
                                                        step: {
                                                            className: "border-circle deal-step",
                                                        },
                                                    }}
                                                />
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                </div>
                                <div className='w-full flex flex-column p-0 card-content__wrapper'>
                                    <div className='flex flex-grow-1'>
                                        {dealsSections.map((section) =>
                                            section.items.map((item: DealsItem) => (
                                                <div
                                                    key={item.itemIndex}
                                                    className={`${
                                                        stepActiveIndex === item.itemIndex
                                                            ? "block deal-form"
                                                            : "hidden"
                                                    }`}
                                                >
                                                    <div className='deal-form__title uppercase'>
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
                                    onClick={() =>
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev - 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        })
                                    }
                                    disabled={!stepActiveIndex}
                                    severity={!stepActiveIndex ? "secondary" : "success"}
                                    className='uppercase px-6 deal__button'
                                    outlined
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() =>
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev + 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        })
                                    }
                                    disabled={stepActiveIndex >= itemsMenuCount}
                                    severity={
                                        stepActiveIndex >= itemsMenuCount ? "secondary" : "success"
                                    }
                                    className='uppercase px-6 deal__button'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button onClick={() => {}} className='uppercase px-6 deal__button'>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
});
