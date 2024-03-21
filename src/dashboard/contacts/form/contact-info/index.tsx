import { Inventory } from "dashboard/inventory/common/step-navigation";
import { lazy } from "react";

const ContactsSocialInfo = lazy(() =>
    import("./contacts").then((module) => ({ default: module.ContactsSocialInfo }))
);
const ContactsWorkplace = lazy(() =>
    import("./workplace").then((module) => ({ default: module.ContactsWorkplace }))
);
const ContactsProspecting = lazy(() =>
    import("./prospecting").then((module) => ({ default: module.ContactsProspecting }))
);

export const ContactInfoData: Pick<Inventory, "label" | "items"> = {
    label: "Contact Information",
    items: [
        { itemLabel: "Contacts", component: <ContactsSocialInfo /> },
        { itemLabel: "Company/Workplace", component: <ContactsWorkplace /> },
        { itemLabel: "Prospecting and notes", component: <ContactsProspecting /> },
    ],
};
