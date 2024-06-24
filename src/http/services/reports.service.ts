import { isAxiosError } from "axios";
import { BaseResponse, BaseResponseError, Status } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { ReportCollection, ReportsPostData } from "common/models/reports";
import { authorizedUserApiInstance } from "http/index";

export const getReportCollection = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`reports/${uid}/collection`);
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting report collection",
        };
    }
};

export const getSpecificDocument = async (uid: string, documentId: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`reports/${uid}/${documentId}`);
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting document",
        };
    }
};

export const getReportTemplate = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`reports/${uid}/get`);
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting report template",
            };
        }
    }
};

export const getCommonReportsList = async () => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponse | BaseResponseError>(
            `reports/list`
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting common reports list",
        };
    }
};

export const getCommonReportsListByState = async (state: string, queryParams?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`reports/${state}/list`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting reports list by state",
        };
    }
};

export const getTasksList = async (queryParams?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`reports/tasks`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting tasks list",
        };
    }
};

export const getQueueList = async (queryParams?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[]>(`reports/queue`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting queue list",
        };
    }
};

export const makeReports = async (uid: string | undefined, body?: ReportsPostData) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponse>(
            `reports/${uid}/report`,
            body
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while making report",
        };
    }
};

export const makeShortReports = async (uid: string | undefined, body?: ReportsPostData) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(
            `reports/${uid}/shortreport`,
            body,
            {
                headers: {
                    Accept: "application/pdf",
                },
                responseType: "blob",
            }
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while making short report",
        };
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
        return {
            status: Status.ERROR,
            error: "Error while getting report",
        };
    }
};

export const createReportCollection = async (
    useruid: string,
    { name, documents }: Partial<ReportCollection>
) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `reports/${useruid}/collection`,
            { name, documents }
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while creating report collection",
        };
    }
};

export const printDocumentByUser = async (userId: string | undefined) => {
    const request = await authorizedUserApiInstance
        .get<any>(`print/${userId}/${userId}`)
        .then((response) => response.data);
    return request;
};

export const getUserReportCollectionsContent = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | ReportCollection>(
            `reports/${uid}/collectionscontent `
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting user report collections content",
        };
    }
};
