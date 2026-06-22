import {
    createFormStepSections,
    FormStepItem,
    FormStepSection,
    FormStepSectionInput,
    getFormStepMenuCount,
    resetFormStepSectionCounters,
} from "dashboard/common/form-stepper";

export enum AccordionItems {
    GENERAL = "General",
    DESCRIPTION = "Description",
    OPTIONS = "Options",
    CHECKS = "Checklist",
    KEYS = "Keys",
    DISCLOSURES = "Disclosures",
    OTHER = "Other",
    FLOORPLAN = "Floorplan",
    CONSIGN = "Consign",
    TITLE = "Title",
    PURCHASES = "Purchases",
    EXPENSES = "Expenses",
    PAYMENTS = "Payments",
    PRICE = "Price and comments",
    DATES = "Dates",
    FUEL = "Fuel Economy",
    EXTRA = "Extra data",
    HISTORY = "History",
    IMAGES = "Images",
    VIDEO = "Video Files",
    AUDIO = "Audio Files",
    DOCUMENTS = "Documents",
    LINKS = "Links",
    WATERMARKING = "Watermarking",
}

export interface InventoryItem extends FormStepItem {
    itemLabel: AccordionItems | string;
}

export interface Inventory {
    label: string;
    items: InventoryItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export type InventorySection = FormStepSection;

export const createInventorySections = (
    sectionInputs: FormStepSectionInput[]
): InventorySection[] => createFormStepSections(sectionInputs);

export { getFormStepMenuCount as getInventoryMenuCount, resetFormStepSectionCounters };
