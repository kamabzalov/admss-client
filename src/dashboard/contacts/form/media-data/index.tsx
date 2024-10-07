import { Contact, ContactAccordionItems } from "dashboard/contacts/common/step-navigation";
import { lazy } from "react";

const ContactsDocuments = lazy(() =>
    import("./documents").then((module) => ({ default: module.ContactsDocuments }))
);

export const ContactMediaData: Pick<Contact, "label" | "items"> = {
    label: "Media data",
    items: [{ itemLabel: ContactAccordionItems.DOCUMENTS, component: <ContactsDocuments /> }],
};
