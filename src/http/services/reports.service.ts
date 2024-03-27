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

export const makeReports = async (uid: string | undefined, body?: any) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`reports/${uid}/report`, body);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getReportById = async (reportId: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`reports/${reportId}/report`, {
            headers: {
                Accept: "application/pdf",
            },
            responseType: "blob",
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const printDocumentByUser = async (userId: string | undefined) => {
    const request = await authorizedUserApiInstance
        .get<any>(`print/${userId}/${userId}`)
        .then((response) => response.data);
    return request;
};
