import {
    createFormStepSections,
    FormStepItem,
    FormStepSection,
    FormStepSectionInput,
    getFormStepMenuCount,
    resetFormStepSectionCounters,
} from "dashboard/common/form-stepper";

export enum ContactAccordionItems {
    BUYER = "Buyer information",
    CO_BUYER = "Co-buyer information",
    CONTACTS = "Contacts",
    COMPANY = "Company/Workplace",
    PROSPECTING = "Prospecting and notes",
    DOCUMENTS = "Documents",
}

export interface ContactItem extends FormStepItem {
    itemLabel: ContactAccordionItems;
}

export interface Contact {
    label: string;
    items: ContactItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export type ContactSection = FormStepSection;

export const createContactSections = (sectionInputs: FormStepSectionInput[]): ContactSection[] =>
    createFormStepSections(sectionInputs);

export { getFormStepMenuCount as getContactMenuCount, resetFormStepSectionCounters };
