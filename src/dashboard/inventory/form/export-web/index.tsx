import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const ExportWebPrice = lazy(() =>
    import("./price").then((module) => ({ default: module.ExportWebPrice }))
);
const ExportWebDates = lazy(() =>
    import("./dates").then((module) => ({ default: module.ExportWebDates }))
);
const ExportWebLinks = lazy(() =>
    import("./links").then((module) => ({ default: module.ExportWebLinks }))
);
const ExportWebFuel = lazy(() =>
    import("./fuel").then((module) => ({ default: module.ExportWebFuel }))
);
const ExportWebExtra = lazy(() =>
    import("./extra").then((module) => ({ default: module.ExportWebExtra }))
);
const ExportWebHistory = lazy(() =>
    import("./history").then((module) => ({ default: module.ExportWebHistory }))
);

export const InventoryExportWebData: Pick<Inventory, "label" | "items"> = {
    label: "Export to WEB",
    items: [
        { itemLabel: "Price and comments", component: <ExportWebPrice /> },
        { itemLabel: "Dates", component: <ExportWebDates /> },
        { itemLabel: "Links", component: <ExportWebLinks /> },
        { itemLabel: "Fuel Economy", component: <ExportWebFuel /> },
        { itemLabel: "Extra data", component: <ExportWebExtra /> },
        { itemLabel: "History", component: <ExportWebHistory /> },
    ],
};
