/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { AxiosResponse } from "axios";
import { BaseResponse } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export interface Inventory {
    BodyStyle: string;
    Category: string;
    Cylinders: string;
    DriveLine: string;
    Engine: string;
    ExteriorColor: string;
    GroupClass: string;
    InteriorColor: string;
    Make: string;
    Model: string;
    Notes: string;
    Options: number;
    Status: string;
    StockNo: string;
    Transmission: string;
    TypeOfFuel: string;
    VIN: string;
    VINimageUID: string;
    Year: string;
    created: string;
    itemuid: string;
    mileage: number;
    name: string;
    updated: string;
    useruid: string;
}

export interface TotalInventoryList extends BaseResponse {
    total: number;
}

type EndpointType =
    | "options"
    | "bodytypes"
    | "exteriorcolors"
    | "interiorcolors"
    | "cylinders"
    | "driveline"
    | "engine"
    | "expensetypes"
    | "fueltypes"
    | "transmissiontypes"
    | "automakes"
    | "category"
    | "status"
    | "group";

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
    name: string;
};

export type MakesListData = ListData & { logo: string };

export const getInventoryOptionsList = async (): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>("options");
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
