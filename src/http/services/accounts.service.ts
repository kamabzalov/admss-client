import { AccountPayment } from "common/models/accounts";
import { BaseResponse } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export interface TotalAccountList extends BaseResponse {
    total: number;
}

export const getAccountsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[] | TotalAccountList>(
            `accounts/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getAccountPayment = async (itemuid: string): Promise<AccountPayment | undefined> => {
    try {
        const request = await authorizedUserApiInstance.get<AccountPayment>(
            `accounts/${itemuid}/payment`
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};
