import { AccordionDealItems } from "dashboard/deals/common";
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
const DealRetailCharges = lazy(() =>
    import("./charges").then((module) => ({ default: module.DealRetailCharges }))
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
const DealRetailContract = lazy(() =>
    import("./contract").then((module) => ({ default: module.DealRetailContract }))
);

export const DealRetail: Pick<Inventory, "label" | "items"> = {
    label: "Retail (Cash)",
    items: [
        { itemLabel: AccordionDealItems.LIENS, component: <DealRetailLiens /> },
        { itemLabel: AccordionDealItems.FIRST_TRADE, component: <DealRetailTradeFirst /> },
        { itemLabel: AccordionDealItems.SECOND_TRADE, component: <DealRetailTradeSecond /> },
        { itemLabel: AccordionDealItems.TAG, component: <DealRetailTag /> },
        { itemLabel: AccordionDealItems.INSURANCE, component: <DealRetailInsurance /> },
        { itemLabel: AccordionDealItems.CHARGES, component: <DealRetailCharges /> },
        { itemLabel: AccordionDealItems.PRODUCTS, component: <DealRetailProducts /> },
        { itemLabel: AccordionDealItems.FINANCES, component: <DealRetailFinances /> },
        { itemLabel: AccordionDealItems.PICKUP, component: <DealRetailPickup /> },
        { itemLabel: AccordionDealItems.CONTRACT, component: <DealRetailContract /> },
    ],
};
