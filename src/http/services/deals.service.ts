import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export const getDealsList = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`deals/${uid}/list`, {});
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
