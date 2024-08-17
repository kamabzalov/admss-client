import { isAxiosError } from "axios";
import { BaseResponseError, Status } from "common/models/base-response";
import { ReportACL, ReportCollection, ReportInfo, ReportsPostData } from "common/models/reports";
import { authorizedUserApiInstance } from "http/index";

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

export const getReportInfo = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<ReportInfo>(
            `reports/${uid}/reportinfo`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting report info",
            };
        }
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

export const getUserReportCollectionsContent = async (uid: string, params?: { qry?: string }) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | ReportCollection>(
            `reports/${uid}/collectionscontent`,
            {
                params,
            }
        );
        return request.data;
    } catch (error) {
        return {
            status: Status.ERROR,
            error: "Error while getting user report collections content",
        };
    }
};

export const getUserFavoriteReportList = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | ReportCollection>(
            `reports/${uid}/favorites`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error:
                    error.response?.data.error || "Error while getting user favorite report list",
            };
        }
    }
};

export const getReportAccessList = async (reportuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | ReportACL>(
            `user/${reportuid}/reportacl`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user report access list",
            };
        }
    }
};

export const upddateReportInfo = async (uid: string, body: Partial<ReportInfo>) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `reports/${uid}/reportinfo`,
            body
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while updating report info",
            };
        }
    }
};
