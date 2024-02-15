import { Inventory } from "dashboard/inventory/common";

export const InventoryVehicleData: Pick<Inventory, "label" | "items"> = {
    label: "Options",
    items: [
        { itemLabel: "General" },
        { itemLabel: "Description" },
        { itemLabel: "Checks" },
        { itemLabel: "Inspections" },
        { itemLabel: "Keys" },
        { itemLabel: "Disclosures" },
    ],
};
