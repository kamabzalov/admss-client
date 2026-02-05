import { ApiRequest } from "http/index";
import { QueryParams } from "common/models/query-params";
import { BaseResponse, BaseResponseError } from "common/models/base-response";
import {
    Deal,
    DealDelete,
    DealFinance,
    DealFinanceRecalculatePayload,
    DealPaymentsTotal,
    DealPickupPayment,
    DealPrintFormResponse,
    DealWashout,
    HowToKnow,
    IndexedDealList,
} from "common/models/deals";

export interface TotalDealsList extends BaseResponse {
    total: number;
}

export const getDealsList = async (
    uid: string,
    queryParams: QueryParams
): Promise<Deal[] | TotalDealsList | BaseResponseError | undefined> => {
    return new ApiRequest().get<Deal[] | TotalDealsList>({
        url: `deals/${uid}/list`,
        config: { params: queryParams },
        defaultError: "Error while getting deals list",
    });
};

export const getDealInfo = async (uid: string) => {
    return new ApiRequest().get<Deal>({
        url: `deals/${uid}/info`,
        defaultError: "Error while getting deal info",
    });
};

interface DealTypeResponse extends BaseResponse {
    deal_types: IndexedDealList[];
}
interface DealStatusList extends BaseResponse {
    deal_status: IndexedDealList[];
}
interface SaleTypeResponse extends BaseResponse {
    sale_types: IndexedDealList[];
}
interface InventoryStatusResponse extends BaseResponse {
    inventory_status: IndexedDealList[];
}

export const getDealTypes = async () => {
    const response = await new ApiRequest().get<DealTypeResponse>({
        url: "deals/listdealtypes",
        defaultError: "Error while get deal types",
    });

    if (response && "deal_types" in response) {
        return response.deal_types;
    }

    return undefined;
};

export const getDealStatuses = async () => {
    const response = await new ApiRequest().get<DealStatusList>({
        url: "deals/listdealstatuses",
        defaultError: "Error while get deal statuses",
    });

    if (response && "deal_status" in response) {
        return response.deal_status;
    }

    return undefined;
};

export const getSaleTypes = async () => {
    const response = await new ApiRequest().get<SaleTypeResponse>({
        url: "deals/listsaletypes",
        defaultError: "Error while get deal sale types",
    });

    if (response && "sale_types" in response) {
        return response.sale_types;
    }

    return undefined;
};

export const getDealInventoryStatuses = async () => {
    const response = await new ApiRequest().get<InventoryStatusResponse>({
        url: "deals/listinventorystatuses",
        defaultError: "Error while get deal inventory statuses",
    });

    if (response && "inventory_status" in response) {
        return response.inventory_status;
    }

    return undefined;
};

export const createDeal = async (
    dealData: Partial<Deal>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/0/set`,
        data: dealData,
        defaultError: "Error while creating deal",
    });
};

export const updateDeal = async (
    dealuid: string,
    dealData: Partial<Deal>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/${dealuid}/set`,
        data: dealData,
        defaultError: "Error while updating deal",
    });
};

export const dealFinancesRecalculate = async (
    dealuid: string,
    payload?: DealFinanceRecalculatePayload
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/${dealuid || 0}/recalculate`,
        data: payload || undefined,
        defaultError: "Error while recalculate deal finance",
        returnErrorObject: false,
    });
};

export const getDealFinance = async (dealuid: string) => {
    return new ApiRequest().get<DealFinance | BaseResponseError>({
        url: `deals/${dealuid || 0}/finance`,
        defaultError: "Error while getting deal finance",
    });
};

export const getDealWashout = async (dealuid: string) => {
    return new ApiRequest().get<DealWashout>({
        url: `deals/${dealuid || 0}/washout`,
        defaultError: "Error while getting deal washout",
    });
};

export const setDealFinance = async (
    dealuid: string,
    dealFinanceData: Partial<DealFinance>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/${dealuid || 0}/finance`,
        data: dealFinanceData,
        defaultError: "Error while setting deal finance",
        returnErrorObject: false,
    });
};

export const getDealPayments = async (dealuid: string) => {
    return new ApiRequest().get<DealPickupPayment[] | BaseResponseError>({
        url: `deals/${dealuid || 0}/ppayments`,
        defaultError: "Error while getting deal payments",
    });
};

export const setDealPayments = async (
    dealuid: string,
    dealPaymentData: Partial<DealPickupPayment>
) => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/${dealuid}/ppayment`,
        data: dealPaymentData,
        defaultError: "Error while setting deal payments",
    });
};

export const getDealPaymentsTotal = async (dealuid: string) => {
    return new ApiRequest().get<DealPaymentsTotal>({
        url: `deals/${dealuid || 0}/ppaymenttotal`,
        defaultError: "Error while getting deal payments total",
    });
};

export const getDealPrintForms = async (dealuid: string) => {
    const response = await new ApiRequest().get<DealPrintFormResponse>({
        url: `print/${dealuid}/deallistforms `,
        defaultError: "Error while getting deal print forms",
        returnErrorObject: false,
    });

    if (response && "status" in response) {
        const { status, ...dataWithoutStatus } = response;
        return dataWithoutStatus;
    }

    return undefined;
};

export const getDealPrintFormTemplate = async (
    dealuid: string,
    templateuid: string
): Promise<Blob | BaseResponseError | undefined> => {
    const response = await new ApiRequest().get<Blob>({
        url: `print/${dealuid}/${templateuid}/dealform`,
        config: { responseType: "blob" },
        defaultError: "Error while getting deal print form template",
        returnErrorObject: false,
    });

    return response as Blob | undefined;
};

export const getHowToKnowList = async (useruid: string) => {
    return new ApiRequest().get<HowToKnow[]>({
        url: `user/${useruid}/howtoknow`,
        defaultError: "Error while getting how to know list",
        returnErrorObject: false,
    }) as Promise<HowToKnow[] | undefined>;
};

export const setHowToKnow = async (
    useruid: string,
    howToKnowData: Partial<HowToKnow>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `user/${useruid}/howtoknow`,
        data: howToKnowData,
        defaultError: "Error while setting how to know item",
        returnErrorObject: false,
    });
};

export const deleteHowToKnow = async (itemuid: string): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `user/${itemuid}/deletehowtoknow`,
        defaultError: "Error while deleting how to know item",
        returnErrorObject: false,
    });
};

export const getDealDeleteReasonsList = async (useruid: string) => {
    return new ApiRequest().get<string[] | BaseResponseError>({
        url: `deals/${useruid}/listdeletionreasons`,
        defaultError: "Error while getting deal delete reasons list",
    });
};

export const deleteDeal = async (
    dealuid: string,
    data: Partial<DealDelete>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponseError>({
        url: `deals/${dealuid}/delete`,
        data,
        defaultError: "Error while deleting deal",
    });
};

export const deleteDealPayment = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `deals/${itemuid}/deleteppayment`,
        defaultError: "Error while deleting payment",
    });
};

export const setDealWashout = async (
    dealuid: string,
    dealWashoutData?: Partial<DealWashout>
): Promise<BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse>({
        url: `deals/${dealuid || 0}/washout`,
        data: dealWashoutData,
        defaultError: "Error while washout deal finance",
        returnErrorObject: false,
    });
};

export const createDealWashout = async (dealuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `print/${dealuid}/dealwash`,
        defaultError: "Error while creating deal washout",
    });
};
