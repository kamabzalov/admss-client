import { ListData } from "common/models";
import { BaseResponseError } from "common/models/base-response";
import { WatermarkPostProcessing } from "common/models/general-settings";
import {
    Inventory,
    TotalInventoryList,
    EndpointType,
    InventorySetResponse,
    InventoryWebInfo,
    InventoryExportWebHistory,
    InventoryPrintForm,
    InventoryWebCheck,
    InventoryCheckVIN,
    InventoryPaymentBack,
    InventoryOptions,
    LocationsListData,
    MakesListData,
    OptionsListData,
    InventoryShortList,
} from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { ApiRequest } from "http/index";

export const getInventoryList = async (
    uid: string,
    queryParams: QueryParams
): Promise<Inventory[] | TotalInventoryList | undefined> => {
    return new ApiRequest().get<Inventory[] | TotalInventoryList>({
        url: `inventory/${uid}/list`,
        config: { params: queryParams },
        defaultError: "Error while getting inventory list",
        returnErrorObject: false,
    }) as Promise<Inventory[] | TotalInventoryList | undefined>;
};

export const getInventoryInfo = async (uid: string) => {
    return new ApiRequest().get<Inventory>({
        url: `inventory/${uid}/info`,
        defaultError: "Error while getting inventory info",
    });
};

export const fetchInventoryList = async <T>(
    endpoint: EndpointType | string
): Promise<T | undefined> => {
    return new ApiRequest().get<T>({
        url: `inventory/list/constants/${endpoint}`,
        defaultError: "Error while fetching inventory list",
        returnErrorObject: false,
    }) as Promise<T | undefined>;
};

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
export const getAutoMakeModelList = async (make: string): Promise<ListData[] | undefined> =>
    await fetchInventoryList<ListData[]>(make);

export const getInventoryDeleteReasonsList = async (useruid: string) => {
    return new ApiRequest().get<ListData[]>({
        url: `inventory/${useruid}/listdeletionreasons`,
        defaultError: "Error while getting inventory delete reasons list",
    });
};

export const getInventoryWebCheck = async (inventoryuid: string) => {
    return new ApiRequest().get<InventoryWebCheck>({
        url: `inventory/${inventoryuid}/webcheck`,
        defaultError: "Error while getting inventory web check",
    });
};

export const getInventoryOptions = async (inventoryuid: string) => {
    return new ApiRequest().get<InventoryOptions>({
        url: `inventory/${inventoryuid}/options`,
        defaultError: "Error while getting inventory options",
    });
};

export const getInventoryGroupOptions = async (groupuid: string) => {
    return new ApiRequest().get<OptionsListData & BaseResponseError>({
        url: `inventory/${groupuid}/groupoptions`,
        defaultError: "Error while getting inventory group options",
    });
};

export const getInventoryPaymentBack = async (inventoryuid: string) => {
    return new ApiRequest().get<InventoryPaymentBack>({
        url: `inventory/${inventoryuid}/paymentpack`,
        defaultError: "Error on get inventory expense",
    });
};

export const getVINCheck = async (VIN: string) => {
    return new ApiRequest().get<InventoryCheckVIN>({
        url: `inventory/${VIN}/checkvin`,
        defaultError: "Error while VIN check",
    });
};

export const getShortInventoryList = async (useruid: string) => {
    return new ApiRequest().get<InventoryShortList[]>({
        url: `inventory/${useruid}/shortlist`,
        defaultError: "Error while getting inventory list",
    });
};

export const updateInventory = async (
    inventoryuid: string,
    inventoryData: Partial<Inventory>
): Promise<InventorySetResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<InventorySetResponse>({
        url: `inventory/${inventoryuid}/set`,
        data: inventoryData,
        defaultError: "Error while updating inventory",
    });
};

export const createInventory = async (
    inventoryData: Partial<Inventory>
): Promise<InventorySetResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<InventorySetResponse>({
        url: `inventory/0/set`,
        data: inventoryData,
        defaultError: "Error while creating inventory",
    });
};

export const deleteInventory = async (inventoryuid: string, data: Record<string, string>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${inventoryuid}/delete`,
        data,
        defaultError: "Error while deleting inventory",
    });
};

export const getInventoryWebInfo = async (
    inventoryuid: string
): Promise<InventoryWebInfo | undefined> => {
    return new ApiRequest().get<InventoryWebInfo>({
        url: `inventory/${inventoryuid}/webinfo`,
        defaultError: "Error while getting inventory web info",
        returnErrorObject: false,
    }) as Promise<InventoryWebInfo | undefined>;
};

export const getInventoryWebInfoHistory = async (
    inventoryuid: string
): Promise<InventoryExportWebHistory[] | undefined> => {
    return new ApiRequest().get<InventoryExportWebHistory[]>({
        url: `external/${inventoryuid}/history`,
        defaultError: "Error while getting inventory web info history",
        returnErrorObject: false,
    }) as Promise<InventoryExportWebHistory[] | undefined>;
};

export const setInventoryExportWeb = async (
    inventoryUid: string,
    inventoryData: Partial<InventoryWebInfo>
): Promise<InventorySetResponse | undefined> => {
    return new ApiRequest().post<InventorySetResponse>({
        url: `inventory/${inventoryUid || 0}/webadd`,
        data: inventoryData,
        defaultError: "Error while setting inventory export web",
        returnErrorObject: false,
    }) as Promise<InventorySetResponse | undefined>;
};

export const getInventoryPrintForms = async (
    inventoryuid: string
): Promise<InventoryPrintForm[] | undefined> => {
    return new ApiRequest().get<InventoryPrintForm[]>({
        url: `print/${inventoryuid}/listforms`,
        defaultError: "Error while getting inventory print forms",
        returnErrorObject: false,
    }) as Promise<InventoryPrintForm[] | undefined>;
};

export const getInventoryPrintFormTemplate = async (
    inventoryuid: string,
    templateuid: string
): Promise<any | undefined> => {
    return new ApiRequest().get<any>({
        url: `print/${inventoryuid}/${templateuid}/form`,
        config: { responseType: "blob" },
        defaultError: "Error while getting inventory print form template",
        returnErrorObject: false,
    }) as Promise<any | undefined>;
};

export const getInventoryLocations = async (useruid: string) => {
    const response = await new ApiRequest().get<LocationsListData>({
        url: `user/${useruid}/locations`,
        defaultError: "Error while getting inventory locations",
    });

    if (response && "locations" in response) {
        return response.locations;
    }

    return undefined;
};

export const checkStockNoAvailability = async (stockno: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/stocknumber`,
        data: { stockno },
        defaultError: "Error on check stock no availability",
    });
};

export const setInventoryWebCheck = async (
    inventoryuid: string,
    { enabled }: Pick<InventoryWebCheck, "enabled">
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${inventoryuid}/webcheck`,
        data: { enabled },
        defaultError: "Error while setting inventory web check",
    });
};

export const setInventoryPaymentBack = async (
    inventoryuid: string,
    inventoryPayment: Partial<InventoryPaymentBack>
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${inventoryuid}/paymentpack`,
        data: inventoryPayment,
        defaultError: "Error on set inventory expense",
    });
};

export const deleteInventoryMake = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${itemuid}/deletemake`,
        defaultError: "Error on delete inventory make",
    });
};

export const deleteInventoryModel = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${itemuid}/deletemodel`,
        defaultError: "Error on delete inventory model",
    });
};

export const updateInventoryWatermark = async (
    inventoryuid: string,
    body?: Partial<WatermarkPostProcessing>
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `inventory/${inventoryuid}/watermark`,
        data: body,
        defaultError: "Error while updating watermark",
    });
};
