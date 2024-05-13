import { authorizedUserApiInstance } from "http/index";
import { QueryParams } from "common/models/query-params";
import { BaseResponse, Status } from "common/models/base-response";
import { Deal, DealFinance, IndexedDealList } from "common/models/deals";

export interface TotalDealsList extends BaseResponse {
    total: number;
}

export const getDealsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<Deal[] | TotalDealsList>(
            `deals/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealInfo = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<Deal>(`deals/${uid}/info`);
        if (request.data.status === Status.OK) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
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
    try {
        const request = await authorizedUserApiInstance.get<DealTypeResponse>(
            "deals/listdealtypes"
        );
        return request.data.deal_types;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealStatuses = async () => {
    try {
        const request = await authorizedUserApiInstance.get<DealStatusList>(
            "deals/listdealstatuses"
        );
        return request.data.deal_status;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getSaleTypes = async () => {
    try {
        const request = await authorizedUserApiInstance.get<SaleTypeResponse>(
            "deals/listsaletypes"
        );
        return request.data.sale_types;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealInventoryStatuses = async () => {
    try {
        const request = await authorizedUserApiInstance.get<InventoryStatusResponse>(
            "deals/listinventorystatuses"
        );
        return request.data.inventory_status;
    } catch (error) {
        // TODO: add error handler
    }
};

export const setDeal = async (
    dealuid: string,
    dealData: Partial<Deal>
): Promise<BaseResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `deals/${dealuid || 0}/set`,
            dealData
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const dealFinancesWashout = async (dealuid: string): Promise<BaseResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `deals/${dealuid || 0}/washout`
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const dealFinancesRecalculate = async (
    dealuid: string
): Promise<BaseResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `deals/${dealuid || 0}/recalculate`
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealFinance = async (dealuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<DealFinance>(
            `deals/${dealuid || 0}/finance`
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const setDealFinance = async (
    dealuid: string,
    dealFinanceData: Partial<DealFinance>
): Promise<BaseResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `deals/${dealuid || 0}/finance`,
            dealFinanceData
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealPayments = async (dealuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`deals/${dealuid || 0}/ppayments`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getDealPaymentsTotal = async (dealuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(
            `deals/${dealuid || 0}/ppaymenttotal`
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
