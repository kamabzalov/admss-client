import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export const getReportsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`reports/${uid}/list`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const makeReports = async (uid: string | undefined) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`reports/${uid}/report`, {});
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getReportById = async (reportId: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`reports/${reportId}/report`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
