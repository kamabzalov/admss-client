/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { AxiosResponse } from "axios";
import { BaseResponse } from "common/models/base-response";
import {
    Inventory,
    TotalInventoryList,
    EndpointType,
    InventoryOptionsInfo,
    InventoryMedia,
    InventorySetResponse,
    CreateMediaItemRecordResponse,
    InventoryWebInfo,
} from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export const getInventoryList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<Inventory[] | TotalInventoryList>(
            `inventory/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getInventoryInfo = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<Inventory>(`inventory/${uid}/info`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const fetchInventoryList = async <T>(endpoint: EndpointType): Promise<T | undefined> => {
    try {
        const response: AxiosResponse<T> = await authorizedUserApiInstance.get(
            `inventory/list/constants/${endpoint}`
        );
        return response.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export type ListData = {
    index?: number;
    id?: number;
    name: string;
};

export type MakesListData = ListData & { logo: string };
export type OptionsListData = ListData & { name: InventoryOptionsInfo };

export const getInventoryOptionsList = async (): Promise<OptionsListData[] | undefined> =>
    await fetchInventoryList<OptionsListData[]>("options");
export const getInventoryBodyTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("bodytypes");
export const getInventoryExteriorColorsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("exteriorcolors");
export const getInventoryInteriorColorsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("interiorcolors");
export const getInventoryCylindersList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("cylinders");
export const getInventoryDrivelineList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("driveline");
export const getInventoryEngineList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("engine");
export const getInventoryExpenseTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("expensetypes");
export const getInventoryFuelTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("fueltypes");
export const getInventoryTransmissionTypesList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("transmissiontypes");
export const getInventoryAutomakesList = async (): Promise<MakesListData[] | undefined> =>
    await fetchInventoryList<MakesListData[]>("automakes");
export const getInventoryCategoryList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("category");
export const getInventoryStatusList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("status");
export const getInventoryGroupList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("group");

export const getInventoryDeleteReasonsList = async (
    useruid: string
): Promise<string[] | unknown> => {
    try {
        const request = await authorizedUserApiInstance.get<ListData[]>(
            `inventory/${useruid}/listdeletionreasons`
        );
        if (request.status === 200) {
            return request.data;
        } else throw new Error();
    } catch (error) {
        return error;
    }
};

export const getInventoryMediaItemList = async (
    inventoryID: string
): Promise<InventoryMedia[] | undefined> => {
    try {
        const request = await authorizedUserApiInstance.get<InventoryMedia[]>(
            `inventory/${inventoryID}/media`
        );
        if (request) {
            return request.data;
        } else throw new Error();
    } catch (error) {
        // TODO: add error handler
    }
};

export const getInventoryMediaItem = async (mediaID: string): Promise<string | undefined> => {
    try {
        const response = await authorizedUserApiInstance.get(`media/${mediaID}/media`, {
            responseType: "blob",
        });

        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new window.FileReader();
            reader.addEventListener("load", (event) => {
                resolve(event.target?.result as string);
            });
            reader.readAsDataURL(response.data);
        });

        return dataUrl;
    } catch (error) {
        // TODO: add error handler
        return undefined;
    }
};

export const setInventory = async (
    inventoryUid: string,
    inventoryData: Partial<Inventory>
): Promise<InventorySetResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<InventorySetResponse>(
            `inventory/${inventoryUid || 0}/set`,
            inventoryData
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const createMediaItemRecord = async () => {
    try {
        const response = await authorizedUserApiInstance.post<CreateMediaItemRecordResponse>(
            "media/0/meta",
            { mediaType: 1 }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const uploadInventoryMedia = async (inventoryUid: string, inventoryData: FormData) => {
    try {
        const response = await authorizedUserApiInstance.post<InventorySetResponse>(
            `media/${inventoryUid || 0}/media`,
            inventoryData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const pairMediaWithInventoryItem = async (inventoryUid: string, mediaitemuid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `inventory/${inventoryUid}/media`,
            {
                mediaitemuid,
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const deleteInventory = async (inventoryuid: string, data: Record<string, string>) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `inventory/${inventoryuid}/delete`,
            data
        );
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO add error handler
    }
};

export const deleteMediaImage = async (itemuid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `inventory/${itemuid}/deletemedia`
        );
        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO add error handler
    }
};

export const getInventoryWebInfo = async (inventoryuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<InventoryWebInfo>(
            `inventory/${inventoryuid}/webinfo`
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getInventoryWebInfoHistory = async (inventoryuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<unknown[]>(
            `external/${inventoryuid}/history`
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
