import { ContactAccordionItems } from "dashboard/contacts/common/step-navigation";
import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const ContactsGeneral = lazy(() =>
    import("./general").then((module) => ({ default: module.ContactsGeneralInfo }))
);
const ContactsGeneralAddress = lazy(() =>
    import("./address").then((module) => ({ default: module.ContactsAddressInfo }))
);
const ContactsMailingAddress = lazy(() =>
    import("./mailing-address").then((module) => ({ default: module.ContactsMailingAddressInfo }))
);
const ContactsIdentification = lazy(() =>
    import("./identification").then((module) => ({ default: module.ContactsIdentificationInfo }))
);

export const GeneralInfoData: Pick<Inventory, "label" | "items"> = {
    label: "General information",
    items: [
        { itemLabel: ContactAccordionItems.GENERAL, component: <ContactsGeneral /> },
        { itemLabel: ContactAccordionItems.ADDRESS, component: <ContactsGeneralAddress /> },
        { itemLabel: ContactAccordionItems.MAILING_ADDRESS, component: <ContactsMailingAddress /> },
        { itemLabel: ContactAccordionItems.IDENTIFICATION, component: <ContactsIdentification /> },
    ],
};
