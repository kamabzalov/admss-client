import { AccordionItems, Inventory } from "dashboard/inventory/common";
import { lazy } from "react";
import "./index.css";
const MediaDataImages = lazy(() =>
    import("dashboard/inventory/form/media-data/images").then((module) => ({
        default: module.ImagesMedia,
    }))
);
const MediaDataVideo = lazy(() =>
    import("dashboard/inventory/form/media-data/video").then((module) => ({
        default: module.VideoMedia,
    }))
);
const MediaDataAudio = lazy(() =>
    import("dashboard/inventory/form/media-data/audio").then((module) => ({
        default: module.AudioMedia,
    }))
);
const MediaDataDocuments = lazy(() =>
    import("dashboard/inventory/form/media-data/documents").then((module) => ({
        default: module.DocumentsMedia,
    }))
);
const MediaDataLinks = lazy(() =>
    import("dashboard/inventory/form/media-data/links").then((module) => ({
        default: module.LinksMedia,
    }))
);
const MediaDataWatermarking = lazy(() =>
    import("dashboard/inventory/form/media-data/watermarking").then((module) => ({
        default: module.inventoryMediaWatermarking,
    }))
);

export const InventoryMediaData: Pick<Inventory, "label" | "items"> = {
    label: "Media data",
    items: [
        { itemLabel: AccordionItems.IMAGES, component: <MediaDataImages /> },
        { itemLabel: AccordionItems.VIDEO, component: <MediaDataVideo /> },
        { itemLabel: AccordionItems.AUDIO, component: <MediaDataAudio /> },
        { itemLabel: AccordionItems.DOCUMENTS, component: <MediaDataDocuments /> },
        { itemLabel: AccordionItems.LINKS, component: <MediaDataLinks /> },
        { itemLabel: AccordionItems.WATERMARKING, component: <MediaDataWatermarking /> },
    ],
};
