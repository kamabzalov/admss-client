import { Inventory } from "dashboard/inventory/common";

export const InventoryPurchaseData: Pick<Inventory, "label" | "items"> = {
    label: "Contact info",
    items: [
        { itemLabel: "Floorplan" },
        { itemLabel: "Consign" },
        { itemLabel: "Title" },
        { itemLabel: "Purchases" },
        { itemLabel: "Expenses" },
        { itemLabel: "Payments" },
    ],
};
