import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const ContactsGeneral = lazy(() =>
    import("./general").then((module) => ({ default: module.ContactsGeneralInfo }))
);

export const GeneralInfoData: Pick<Inventory, "label" | "items"> = {
    label: "General information",
    items: [{ itemLabel: "General", component: <ContactsGeneral /> }],
};
