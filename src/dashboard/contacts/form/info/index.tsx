import { Inventory } from "dashboard/inventory/common";
import { PurchaseFloorplan } from "dashboard/inventory/form/purchase/floorplan";
import { PurchaseConsign } from "dashboard/inventory/form/purchase/consign";

export const InventoryPurchaseData: Pick<Inventory, "label" | "items"> = {
    label: "Contact info",
    items: [
        { itemLabel: "Floorplan", component: <PurchaseFloorplan /> },
        { itemLabel: "Consign", component: <PurchaseConsign /> },
        { itemLabel: "Title" },
        { itemLabel: "Purchases" },
        { itemLabel: "Expenses" },
        { itemLabel: "Payments" },
    ],
};
