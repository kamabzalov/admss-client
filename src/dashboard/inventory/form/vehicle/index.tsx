import "./index.css";
import { VehicleChecks } from "./checks";
import { VehicleDescription } from "./description";
import { VehicleDisclosures } from "./disclosures";
import { VehicleGeneral } from "./general";
import { VehicleInspections } from "./inspections";
import { VehicleKeys } from "./keys";
import { VehicleOther } from "./other";
import { VehicleOptions } from "./options";
import { Inventory } from "dashboard/inventory/common";

export const InventoryVehicleData: Pick<Inventory, "label" | "items"> = {
    label: "Vehicle",
    items: [
        { itemLabel: "General", component: <VehicleGeneral /> },
        { itemLabel: "Description", component: <VehicleDescription /> },
        { itemLabel: "Options", component: <VehicleOptions /> },
        { itemLabel: "Checks", component: <VehicleChecks /> },
        { itemLabel: "Inspections", component: <VehicleInspections /> },
        { itemLabel: "Keys", component: <VehicleKeys /> },
        { itemLabel: "Disclosures", component: <VehicleDisclosures /> },
        { itemLabel: "Other", component: <VehicleOther /> },
    ],
};
