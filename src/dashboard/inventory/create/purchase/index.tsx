import { Inventory } from "dashboard/inventory/common";

export const InventoryPurchaseData: Pick<Inventory, "label" | "items"> = {
    label: "Purchase",
    items: [
        { itemLabel: "Floorplan" },
        { itemLabel: "Consign" },
        { itemLabel: "Title" },
        { itemLabel: "Purchases" },
        { itemLabel: "Expenses" },
        { itemLabel: "Payments" },
    ],
};
