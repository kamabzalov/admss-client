import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const DealsSale = lazy(() =>
    import("./sale").then((module) => ({ default: module.DealGeneralSale }))
);
const DealsOdometer = lazy(() =>
    import("./odometer").then((module) => ({ default: module.DealGeneralOdometer }))
);
const DealsSeller = lazy(() =>
    import("./seller").then((module) => ({ default: module.DealGeneralSeller }))
);

export const DealGeneralInfo: Pick<Inventory, "label" | "items"> = {
    label: "General information",
    items: [
        { itemLabel: "Sale", component: <DealsSale /> },
        { itemLabel: "Odometer", component: <DealsOdometer /> },
        { itemLabel: "Seller", component: <DealsSeller /> },
    ],
};
