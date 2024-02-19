import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const ContactsDocuments = lazy(() =>
    import("./documents").then((module) => ({ default: module.ContactsDocuments }))
);

export const ContactMediaData: Pick<Inventory, "label" | "items"> = {
    label: "Media data",
    items: [{ itemLabel: "Documents", component: <ContactsDocuments /> }],
};
