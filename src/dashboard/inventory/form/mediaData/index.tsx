import { Inventory } from "dashboard/inventory/common";

export const InventoryMediaData: Pick<Inventory, "label" | "items"> = {
    label: "Media data",
    items: [
        { itemLabel: "Images" },
        { itemLabel: "Video" },
        { itemLabel: "Audio" },
        { itemLabel: "Documents" },
    ],
};
