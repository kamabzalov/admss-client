import { MenuItem } from "primereact/menuitem";
import { ReactElement } from "react";

export interface FormStepItem extends MenuItem {
    itemLabel: string;
    itemIndex?: number;
    component?: ReactElement;
}

export interface FormStepSection {
    sectionId: number;
    label: string;
    startIndex: number;
    items: FormStepItem[];
    getLength: () => number;
}

export interface FormStepSectionInput {
    label: string;
    items: { itemLabel: string; component?: ReactElement }[];
}

export type FormStepAccordionExpandMode = "all" | "sync-with-step" | "controlled";
