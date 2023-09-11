import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export const getAccountsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`accounts/${uid}/list`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
