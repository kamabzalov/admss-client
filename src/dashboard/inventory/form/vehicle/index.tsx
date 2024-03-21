import { Inventory } from "dashboard/inventory/common/step-navigation";
import { lazy } from "react";

const VehicleGeneral = lazy(() =>
    import("./general").then((module) => ({ default: module.VehicleGeneral }))
);
const VehicleKeys = lazy(() =>
    import("./keys").then((module) => ({ default: module.VehicleKeys }))
);
const VehicleChecks = lazy(() =>
    import("./checks").then((module) => ({ default: module.VehicleChecks }))
);
const VehicleDescription = lazy(() =>
    import("./description").then((module) => ({ default: module.VehicleDescription }))
);
const VehicleDisclosures = lazy(() =>
    import("./disclosures").then((module) => ({ default: module.VehicleDisclosures }))
);
const VehicleInspections = lazy(() =>
    import("./inspections").then((module) => ({ default: module.VehicleInspections }))
);
const VehicleOther = lazy(() =>
    import("./other").then((module) => ({ default: module.VehicleOther }))
);
const VehicleOptions = lazy(() =>
    import("./options").then((module) => ({ default: module.VehicleOptions }))
);

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
