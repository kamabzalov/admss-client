import "dashboard/common/form-stepper/index.css";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Steps } from "primereact/steps";
import { ReactElement, ReactNode, RefObject, useEffect } from "react";
import {
    FormStepAccordionExpandMode,
    FormStepItem,
    FormStepSection,
} from "dashboard/common/form-stepper/types";

const normalizeAccordionIndices = (index: number | number[]): number[] =>
    (Array.isArray(index) ? index : [index]).slice().sort((a, b) => a - b);

const areAccordionIndicesEqual = (a: number | number[], b: number | number[]): boolean => {
    const normalizedA = normalizeAccordionIndices(a);
    const normalizedB = normalizeAccordionIndices(b);

    if (normalizedA.length !== normalizedB.length) {
        return false;
    }

    return normalizedA.every((value, index) => value === normalizedB[index]);
};

const EMPTY_STEP_INDICES: number[] = [];

const getCurrentAccordionIndices = (index: number | number[]): number[] =>
    Array.isArray(index) ? index : [index];

export interface FormStepAccordionProps {
    sections: FormStepSection[];
    stepActiveIndex: number;
    accordionActiveIndex: number | number[];
    onAccordionChange: (index: number | number[]) => void;
    onStepChange: (globalIndex: number) => void;
    errorSections?: string[];
    resolveStepClassName?: (item: FormStepItem, globalIndex: number) => string;
    accordionClassName?: string;
    stepClassName?: string;
    renderSectionHeader?: (section: FormStepSection) => ReactNode;
    footer?: ReactNode;
    navigationRef?: RefObject<HTMLDivElement | null>;
    expandMode?: FormStepAccordionExpandMode;
    collapseOnStepIndices?: number[];
    preventEmptyAccordion?: boolean;
    wrapperClassName?: string;
}

export const FormStepAccordion = ({
    sections,
    stepActiveIndex,
    accordionActiveIndex,
    onAccordionChange,
    onStepChange,
    errorSections = [],
    resolveStepClassName,
    accordionClassName = "",
    stepClassName = "border-circle",
    renderSectionHeader,
    footer,
    navigationRef,
    expandMode = "controlled",
    collapseOnStepIndices = EMPTY_STEP_INDICES,
    preventEmptyAccordion = false,
    wrapperClassName = "",
}: FormStepAccordionProps): ReactElement => {
    useEffect(() => {
        if (expandMode !== "all" || sections.length === 0) {
            return;
        }

        const nextIndices = sections.map((_, index) => index);

        if (!areAccordionIndicesEqual(accordionActiveIndex, nextIndices)) {
            onAccordionChange(nextIndices);
        }
    }, [sections, expandMode, onAccordionChange]);

    useEffect(() => {
        if (expandMode !== "sync-with-step") {
            return;
        }

        if (collapseOnStepIndices.includes(stepActiveIndex)) {
            if (!areAccordionIndicesEqual(accordionActiveIndex, [])) {
                onAccordionChange([]);
            }
            return;
        }

        const startIndices = sections.map((section) => section.startIndex);
        let activeAccordionIndex = 0;

        startIndices.forEach((step, index) => {
            if (stepActiveIndex >= step) {
                activeAccordionIndex = index;
            }
        });

        const currentIndices = getCurrentAccordionIndices(accordionActiveIndex);

        if (currentIndices.includes(activeAccordionIndex)) {
            return;
        }

        const nextIndices = [...currentIndices, activeAccordionIndex].sort((a, b) => a - b);

        onAccordionChange(nextIndices);
    }, [stepActiveIndex, sections, expandMode, collapseOnStepIndices, onAccordionChange]);

    useEffect(() => {
        if (!navigationRef?.current) {
            return;
        }

        const activeStep = navigationRef.current.querySelector("[aria-selected='true']");

        if (activeStep) {
            activeStep.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [stepActiveIndex, navigationRef]);

    const handleAccordionChange = (index: number | number[]) => {
        if (preventEmptyAccordion) {
            const newIndex = Array.isArray(index) ? index : [index];

            if (newIndex.length === 0) {
                return;
            }
        }

        onAccordionChange(index);
    };

    const getValidationStepClassName = (itemLabel: string): string => {
        if (!errorSections.length) {
            return "";
        }

        return errorSections.includes(itemLabel) ? "section-invalid" : "section-valid";
    };

    const getStepClassName = (item: FormStepItem, globalIndex: number): string => {
        if (resolveStepClassName) {
            return resolveStepClassName(item, globalIndex);
        }

        return getValidationStepClassName(item.itemLabel);
    };

    return (
        <div className={wrapperClassName} ref={navigationRef}>
            <Accordion
                activeIndex={accordionActiveIndex}
                onTabChange={(event) => handleAccordionChange(event.index)}
                multiple
                className={accordionClassName}
            >
                {sections.map((section) => (
                    <AccordionTab
                        key={section.sectionId}
                        header={renderSectionHeader?.(section) ?? section.label}
                    >
                        <Steps
                            readOnly={false}
                            activeIndex={stepActiveIndex - section.startIndex}
                            onSelect={(event) => onStepChange(event.index + section.startIndex)}
                            model={section.items.map((item, idx) => ({
                                label: item.itemLabel,
                                template: item.template,
                                command: () => onStepChange(section.startIndex + idx),
                                className: getStepClassName(item, section.startIndex + idx),
                            }))}
                            className='vertical-step-menu'
                            pt={{
                                menu: { className: "flex-column w-full" },
                                step: { className: stepClassName },
                            }}
                        />
                    </AccordionTab>
                ))}
            </Accordion>
            {footer}
        </div>
    );
};
