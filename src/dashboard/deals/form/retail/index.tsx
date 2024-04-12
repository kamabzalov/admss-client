import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";

const DealRetailLiens = lazy(() =>
    import("./liens").then((module) => ({ default: module.DealRetailLiens }))
);
const DealRetailTradeFirst = lazy(() =>
    import("./trade-first").then((module) => ({ default: module.DealRetailTradeFirst }))
);
const DealRetailTradeSecond = lazy(() =>
    import("./trade-second").then((module) => ({ default: module.DealRetailTradeSecond }))
);
const DealRetailTag = lazy(() =>
    import("./tag").then((module) => ({ default: module.DealRetailTag }))
);
const DealRetailInsurance = lazy(() =>
    import("./insurance").then((module) => ({ default: module.DealRetailInsurance }))
);
const DealRetailProducts = lazy(() =>
    import("./products").then((module) => ({ default: module.DealRetailProducts }))
);
const DealRetailFinances = lazy(() =>
    import("./finances").then((module) => ({ default: module.DealRetailFinances }))
);
const DealRetailPickup = lazy(() =>
    import("./pickup").then((module) => ({ default: module.DealRetailPickup }))
);

export const DealRetail: Pick<Inventory, "label" | "items"> = {
    label: "Retail (Cash)",
    items: [
        { itemLabel: "Liens", component: <DealRetailLiens /> },
        { itemLabel: "Trade 1", component: <DealRetailTradeFirst /> },
        { itemLabel: "Trade 2", component: <DealRetailTradeSecond /> },
        { itemLabel: "Tag", component: <DealRetailTag /> },
        { itemLabel: "Insurance", component: <DealRetailInsurance /> },
        { itemLabel: "Products", component: <DealRetailProducts /> },
        { itemLabel: "Finances", component: <DealRetailFinances /> },
        { itemLabel: "Pickup", component: <DealRetailPickup /> },
    ],
};
