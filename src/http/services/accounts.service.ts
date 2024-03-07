import { AccountPayment } from "common/models/accounts";
import { BaseResponse } from "common/models/base-response";
import { InventoryExtData } from "common/models/inventory";
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

export const getAccountPaymentsList = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<AccountPayment[]>(
            `accounts/${itemuid}/listpayments`
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const setAccountPayment = async (
    itemuid: string,
    accountPayment: Partial<AccountPayment> | Partial<InventoryExtData>
) => {
    try {
        const request = await authorizedUserApiInstance.post(
            `accounts/${itemuid}/payment`,
            accountPayment
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};
