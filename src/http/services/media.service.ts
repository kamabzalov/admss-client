import { BaseResponse, BaseResponseError, Status } from "common/models/base-response";
import { MediaType } from "common/models/enums";
import {
    InventoryMedia,
    CreateMediaItemRecordResponse,
    InventorySetResponse,
    InventoryMediaInfo,
    InventoryMediaPostData,
} from "common/models/inventory";
import { ApiRequest } from "http/index";

export const getInventoryMediaItemList = async (
    inventoryID: string
): Promise<InventoryMedia[] | undefined> => {
    const response = await new ApiRequest().get<InventoryMedia[]>({
        url: `inventory/${inventoryID}/media`,
        defaultError: "Error while getting inventory media list",
    });

    if (response && Array.isArray(response)) {
        return response;
    }

    return undefined;
};

export const getInventoryMediaItem = async (mediaID: string): Promise<string | undefined> => {
    const response = await new ApiRequest().get<Blob | BaseResponseError>({
        url: `media/${mediaID}/media`,
        config: { responseType: "blob" },
        defaultError: "Error while getting media item",
    });

    if (!response || "status" in (response as BaseResponseError)) {
        return undefined;
    }

    const blob = response as Blob;

    const dataUrl = await new Promise<string>((resolve) => {
        const reader = new window.FileReader();
        reader.addEventListener("load", (event) => {
            resolve(event.target?.result as string);
        });
        reader.readAsDataURL(blob);
    });

    return dataUrl;
};

export const getInventoryMediaInfo = async (
    mediauid: string
): Promise<InventoryMediaInfo | BaseResponseError | undefined> => {
    return new ApiRequest().get<InventoryMediaInfo>({
        url: `inventory/${mediauid}/mediaitem`,
        defaultError: "Error while getting media info",
    });
};

export const createMediaItemRecord = async (
    mediaType?: MediaType
): Promise<CreateMediaItemRecordResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<CreateMediaItemRecordResponse>({
        url: "media/0/meta",
        data: { mediaType },
        defaultError: "Error while creating media item record",
    });
};

export const uploadInventoryMedia = async (
    inventoryUid: string,
    inventoryData: FormData
): Promise<InventorySetResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<InventorySetResponse>({
        url: `media/${inventoryUid || 0}/media`,
        data: inventoryData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
        defaultError: "Error while uploading media",
    });
};

export const uploadUserLogo = async (
    useruid: string,
    file: File
): Promise<BaseResponse | BaseResponseError | undefined> => {
    const formData = new FormData();
    formData.append("file", file);

    return new ApiRequest().post<BaseResponse | BaseResponseError>({
        url: `media/${useruid}/logo`,
        data: formData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
        defaultError: "Error while uploading user logo",
    });
};

export const setMediaItemData = async (
    inventoryUid: string,
    {
        mediaitemuid,
        notes,
        itemuid,
        order,
        mediaurl,
        contenttype,
        useruid,
        type,
    }: Partial<InventoryMediaPostData>
) => {
    const id = inventoryUid ? inventoryUid : 0;

    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${id}/media`,
        data: {
            mediaitemuid,
            mediaurl,
            useruid,
            itemuid,
            contenttype,
            notes,
            order,
            type,
        },
        defaultError: "Error while setting media item data",
    });
};

export const setMediaItemMeta = async (
    mediaitemuid: string,
    { order }: Partial<InventoryMediaPostData>
) => {
    return new ApiRequest().post<BaseResponse>({
        url: `media/${mediaitemuid}/meta`,
        data: { order },
        defaultError: "Error while setting media item meta",
    });
};

export const deleteMediaImage = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponse | BaseResponseError>({
        url: `inventory/${itemuid}/deletemedia`,
        defaultError: "Error while deleting media image",
    });
};

type MediaWatermarkPreviewSuccess = {
    status: Status.OK;
    data: string;
    error?: string;
};

type MediaWatermarkPreviewError = {
    status: Status.ERROR;
    error?: string;
    data?: string;
};

export const getMediaWatermarkingPreview = async (
    inventoryuid: string
): Promise<MediaWatermarkPreviewSuccess | MediaWatermarkPreviewError> => {
    const response = await new ApiRequest().get<Blob | BaseResponseError>({
        url: `media/${inventoryuid}/watermarkpreview`,
        config: { responseType: "blob" },
        defaultError: "Error while getting media watermarking preview",
    });

    if (!response) {
        return {
            status: Status.ERROR,
            error: "Error while getting media watermarking preview",
        };
    }

    const errorResponse = response as BaseResponseError;
    if (errorResponse.status === Status.ERROR) {
        return {
            status: Status.ERROR,
            error: errorResponse.error,
        };
    }

    const blob = response as Blob;

    const dataUrl = await new Promise<string>((resolve) => {
        const reader = new window.FileReader();
        reader.addEventListener("load", (event) => {
            resolve(event.target?.result as string);
        });
        reader.readAsDataURL(blob);
    });

    return {
        status: Status.OK,
        data: dataUrl,
    };
};
