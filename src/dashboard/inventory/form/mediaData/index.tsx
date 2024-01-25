import { Inventory } from "dashboard/inventory/common";
import { lazy } from "react";
const MediaDataImages = lazy(() =>
    import("./images").then((module) => ({ default: module.ImagesMedia }))
);
const MediaDataVideo = lazy(() =>
    import("./video").then((module) => ({ default: module.VideoMedia }))
);
const MediaDataAudio = lazy(() =>
    import("./audio").then((module) => ({ default: module.AudioMedia }))
);
const MediaDataDocuments = lazy(() =>
    import("./documents").then((module) => ({ default: module.DocumentsMedia }))
);

export const InventoryMediaData: Pick<Inventory, "label" | "items"> = {
    label: "Media data",
    items: [
        { itemLabel: "Images", component: <MediaDataImages /> },
        { itemLabel: "Video", component: <MediaDataVideo /> },
        { itemLabel: "Audio", component: <MediaDataAudio /> },
        { itemLabel: "Documents", component: <MediaDataDocuments /> },
    ],
};
