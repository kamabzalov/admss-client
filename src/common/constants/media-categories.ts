import { TypeList } from "common/models";
import { ContentType } from "common/models/enums";

export const CATEGORIES: readonly TypeList[] = [
    { name: "Interior", id: ContentType.ctInterior },
    { name: "Exterior", id: ContentType.ctExterior },
    { name: "Document", id: ContentType.ctDocument },
    { name: "General", id: ContentType.ctGeneral },
];

export enum UPLOAD_TEXT {
    VIDEO = "Fill the fields below to save uploaded video files",
    AUDIO = "Fill the fields below to save uploaded audio files",
    DOCUMENTS = "Fill the fields below to save uploaded documents",
    IMAGES = "Fill the fields below to save uploaded images",
}
