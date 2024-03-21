import { Inventory } from "dashboard/inventory/common/step-navigation";
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
        { itemLabel: "General", component: <ContactsGeneral /> },
        { itemLabel: "Address", component: <ContactsGeneralAddress /> },
        { itemLabel: "Mailing address", component: <ContactsMailingAddress /> },
        { itemLabel: "Identification", component: <ContactsIdentification /> },
    ],
};
