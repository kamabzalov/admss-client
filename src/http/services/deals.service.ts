import { authorizedUserApiInstance } from "http/index";
import { QueryParams } from "common/models/query-params";
import { BaseResponse, Status } from "common/models/base-response";
import { Deal, DealType, SaleType } from "common/models/deals";

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
    deal_types: DealType[];
}

interface SaleTypeResponse extends BaseResponse {
    sale_types: SaleType[];
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
