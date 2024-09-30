import { ContactAccordionItems } from "dashboard/contacts/common/step-navigation";
import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const ContactsDocuments = lazy(() =>
    import("./documents").then((module) => ({ default: module.ContactsDocuments }))
);

export const ContactMediaData: Pick<Inventory, "label" | "items"> = {
    label: "Media data",
    items: [{ itemLabel: ContactAccordionItems.DOCUMENTS, component: <ContactsDocuments /> }],
};
