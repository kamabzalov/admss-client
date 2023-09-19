import { authorizedUserApiInstance } from "http/index";
import { QueryParams } from "common/models/query-params";

export const getDealsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`deals/${uid}/list`, {});
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
