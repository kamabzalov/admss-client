import { Inventory } from "dashboard/inventory/common";
import { PurchaseFloorplan } from "./froorplan";
import { PurchaseConsign } from "./consign";

export const InventoryPurchaseData: Pick<Inventory, "label" | "items"> = {
    label: "Purchase",
    items: [
        { itemLabel: "Floorplan", component: <PurchaseFloorplan /> },
        { itemLabel: "Consign", component: <PurchaseConsign /> },
        { itemLabel: "Title" },
        { itemLabel: "Purchases" },
        { itemLabel: "Expenses" },
        { itemLabel: "Payments" },
    ],
};
