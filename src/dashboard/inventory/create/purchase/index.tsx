import { Inventory } from "dashboard/inventory/common";
import { PurchaseFloorplan } from "./froorplan";
import { PurchaseConsign } from "./consign";
import { PurchaseTitle } from "./title";
import { PurchasePurchases } from "./purchases";
import { PurchasePayments } from "./payments";

export const InventoryPurchaseData: Pick<Inventory, "label" | "items"> = {
    label: "Purchase",
    items: [
        { itemLabel: "Floorplan", component: <PurchaseFloorplan /> },
        { itemLabel: "Consign", component: <PurchaseConsign /> },
        { itemLabel: "Title", component: <PurchaseTitle /> },
        { itemLabel: "Purchases", component: <PurchasePurchases /> },
        { itemLabel: "Expenses" },
        { itemLabel: "Payments", component: <PurchasePayments /> },
    ],
};
