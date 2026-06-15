import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { ReactElement } from "react";
import { Button } from "primereact/button";
import { FormStepSection, FormStepSectionInput } from "dashboard/common/form-stepper/types";

let sectionCounter = 0;
let itemIndex = 0;
let instancesCount = 0;

export const resetFormStepSectionCounters = (): void => {
    sectionCounter = 0;
    itemIndex = 0;
    instancesCount = 0;
};

const createVerticalNavTemplate =
    (sectionItemsLength: number) =>
    (
        item: MenuItem,
        { props, onClick, className, labelClassName }: MenuItemOptions,
        index: number
    ): ReactElement => {
        const isActive =
            (instancesCount > sectionItemsLength || index <= props.activeIndex) &&
            props.activeIndex !== 0;

        return (
            <Button onClick={onClick} className={`${className} vertical-nav`}>
                <label
                    className={`vertical-nav__icon p-steps-number ${
                        isActive && "p-steps-number--green"
                    } border-circle`}
                />
                <span className={`${labelClassName} vertical-nav__label`}>{item.label}</span>
            </Button>
        );
    };

export const createFormStepSections = (
    sectionInputs: FormStepSectionInput[]
): FormStepSection[] => {
    instancesCount = sectionInputs.length;

    return sectionInputs.map(({ label, items }) => {
        const sectionId = ++sectionCounter;
        const sectionItems = items.map(({ itemLabel, component }, index) => ({
            itemLabel,
            component,
            itemIndex: itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) =>
                createVerticalNavTemplate(items.length)(item, options, index),
        }));
        const startIndex = itemIndex - sectionItems.length;

        return {
            sectionId,
            label,
            startIndex,
            items: sectionItems,
            getLength: () => sectionItems.length,
        };
    });
};

export const getFormStepMenuCount = (sections: FormStepSection[]): number =>
    sections.reduce((acc, section) => acc + section.getLength(), -1);
