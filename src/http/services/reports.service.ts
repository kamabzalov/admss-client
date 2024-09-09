import { isAxiosError } from "axios";
import { BaseResponseError, Status } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import {
    ReportACL,
    ReportCollection,
    ReportCreate,
    ReportDocument,
    ReportInfo,
    ReportServiceColumns,
    ReportServices,
    ReportsPostData,
} from "common/models/reports";
import { authorizedUserApiInstance } from "http/index";

export const Document = async (uid: string) => {
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

export const getReportTaskResult = async (taskuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`reports/${taskuid}/report`, {
            headers: {
                Accept: "application/pdf",
            },
            responseType: "blob",
        });
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting report task result",
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

export const getReportAccessList = async (reportuid: string, params?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | ReportACL>(
            `user/${reportuid}/reportacl`,
            { params }
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

export const getReportDocumentTemplate = async (documentuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | any>(
            `reports/${documentuid}/template`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error:
                    error.response?.data.error ||
                    "Error while getting user report document template",
            };
        }
    }
};

export const getReportColumns = async ({
    service,
    useruid,
}: {
    service: ReportServices;
    useruid: string;
}) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | any>(
            `${service}/${useruid}/reportcolumns`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting report columns",
            };
        }
    }
};

export const createCustomReport = async (
    body: Partial<ReportCreate> & { columns: ReportServiceColumns[] }
) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `reports/0/set`,
            body
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while creating custom report",
            };
        }
    }
};

export const updateReportInfo = async (uid: string, body: Partial<ReportDocument & ReportInfo>) => {
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

export const printReportInfo = async (
    useruid: string,
    {
        itemUID,
        columns,
    }: { itemUID: string; columns: { name: string; data: string; with: number }[] }
) => {
    try {
        const request = await authorizedUserApiInstance.post<
            BaseResponseError & { taskuid: string }
        >(`reports/${useruid}/report`, { itemUID, columns });
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

export const setReportDocumentTemplate = async (
    documentuid: string,
    { itemUID, columns }: { itemUID: string; columns: Partial<ReportServiceColumns>[] }
) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(
            `reports/${documentuid}/template`,
            { DocumentID: itemUID, columns },
            {
                headers: {
                    Accept: "application/pdf",
                },
                responseType: "blob",
            }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting report document template",
            };
        }
    }
};

export const setReportAccessList = async (reportuid: string, reportACL: Partial<ReportACL>) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`user/${reportuid}/reportacl`, {
            ...reportACL,
        });
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting report access list",
            };
        }
    }
};
