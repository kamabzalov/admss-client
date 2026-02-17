import { BaseResponseError } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import {
    ReportACL,
    ReportCollection,
    ReportCollectionUpdate,
    ReportCreate,
    ReportFont,
    ReportInfo,
    ReportServiceColumns,
    ReportServices,
    ReportSetParams,
    ReportsPostData,
} from "common/models/reports";
import { ApiRequest } from "http/index";

export const Document = async (uid: string) => {
    return new ApiRequest().get<any>({
        url: `reports/${uid}/get`,
        defaultError: "Error while getting report template",
    });
};

export const getReportInfo = async (uid: string) => {
    return new ApiRequest().get<ReportInfo>({
        url: `reports/${uid}/reportinfo`,
        defaultError: "Error while getting report info",
    });
};

export const getReportTaskResult = async (taskuid: string) => {
    return new ApiRequest().get<any>({
        url: `reports/${taskuid}/report`,
        config: {
            headers: {
                Accept: "application/pdf",
            },
            responseType: "blob",
        },
        defaultError: "Error while getting report task result",
    });
};

export const makeShortReports = async (uid: string | undefined, body?: ReportsPostData) => {
    return new ApiRequest().post<any>({
        url: `reports/${uid}/shortreport`,
        data: body,
        config: {
            headers: {
                Accept: "application/pdf",
            },
            responseType: "blob",
        },
        defaultError: "Error while making short report",
    });
};

export const createReportCollection = async (
    useruid: string,
    { name, documents, itemuid }: Partial<ReportCollectionUpdate>
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${useruid}/collection`,
        data: { name, documents, itemuid },
        defaultError: "Error while creating report collection",
    });
};

export const getUserReportCollectionsContent = async (uid: string, params?: { qry?: string }) => {
    return new ApiRequest().get<ReportCollection>({
        url: `reports/${uid}/collectionscontent`,
        config: { params },
        defaultError: "Error while getting user report collections content",
    });
};

export const getUserFavoriteReportList = async (uid: string) => {
    return new ApiRequest().get<ReportCollection>({
        url: `reports/${uid}/favorites`,
        defaultError: "Error while getting user favorite report list",
    });
};

export const getReportAccessList = async (reportuid: string, params?: QueryParams) => {
    return new ApiRequest().get<ReportACL>({
        url: `user/${reportuid}/reportacl`,
        config: { params },
        defaultError: "Error while getting user report access list",
    });
};

export const getReportAccessListForNewReport = async (params?: QueryParams) => {
    return new ApiRequest().get<ReportACL>({
        url: `user/report-acl`,
        config: { params },
        defaultError: "Error while getting report access list for new report",
    });
};

export const getReportDocumentTemplate = async (documentuid: string) => {
    return new ApiRequest().get<any>({
        url: `reports/${documentuid}/template`,
        defaultError: "Error while getting user report document template",
    });
};

export const getReportDatasets = async (useruid: string) => {
    return new ApiRequest().get<any>({
        url: `reports/${useruid}/datasets`,
        defaultError: "Error while getting report datasets",
    });
};

export const getReportColumns = async ({
    service,
    useruid,
}: {
    service: ReportServices;
    useruid: string;
}) => {
    return new ApiRequest().get<any>({
        url: `${service}/${useruid}/reportcolumns`,
        defaultError: "Error while getting report columns",
    });
};

export const getReportFonts = async (useruid: string) => {
    return new ApiRequest().get<ReportFont[]>({
        url: `reports/${useruid}/fonts`,
        defaultError: "Error while getting report fonts",
    });
};

export const createCustomReport = async (
    body: Partial<ReportCreate> & { columns: ReportServiceColumns[] }
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/0/set`,
        data: body,
        defaultError: "Error while creating custom report",
    });
};

export const updateReportInfo = async (reportuid: string, body: Partial<ReportSetParams>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${reportuid}/reportinfo`,
        data: body,
        defaultError: "Error while updating report info",
    });
};

export const printReportInfo = async (
    useruid: string,
    {
        itemUID,
        columns,
    }: { itemUID: string; columns: { name: string; data: string; with: number }[] }
) => {
    return new ApiRequest().post<BaseResponseError & { taskuid: string }>({
        url: `reports/${useruid}/report`,
        data: { itemUID, columns },
        defaultError: "Error while updating report info",
    });
};

export const setReportDocumentTemplate = async (
    documentuid: string,
    templateParams: ReportSetParams
) => {
    return new ApiRequest().post<any>({
        url: `reports/${documentuid}/template`,
        data: templateParams,
        config: {
            headers: {
                Accept: "application/pdf",
            },
            responseType: "blob",
        },
        defaultError: "Error while setting report document template",
    });
};

export const copyReportDocument = async (documentuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${documentuid}/copy`,
        defaultError: "Error while copying report document",
    });
};

export const deleteReportDocument = async (documentuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${documentuid}/delete`,
        defaultError: "Error while deleting report document",
    });
};

export const setReportAccessList = async (reportuid: string, reportACL: Partial<ReportACL>) => {
    return new ApiRequest().post<any>({
        url: `user/${reportuid}/reportacl`,
        data: { ...reportACL },
        defaultError: "Error while setting report access list",
    });
};

export const deleteReportCollection = async (collectionuid: string, reportuid?: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${collectionuid}/${reportuid || 0}/delete`,
        defaultError: "Error while deleting report collection",
    });
};

export const moveReportToCollection = async (
    collectionuid: string,
    reportuid: string,
    newCollectionuid: string
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${collectionuid}/${reportuid}/move`,
        data: { collectionuid: newCollectionuid },
        defaultError: "Error while moving report to collection",
    });
};

export const addReportToCollection = async (collectionuid: string, reportuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${collectionuid}/${reportuid}/add`,
        defaultError: "Error while adding report to collection",
    });
};

export const setReportOrder = async (collectionuid: string, reportuid: string, order: number) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${collectionuid}/${reportuid}/order`,
        data: { order },
        defaultError: "Error while changing report order",
    });
};

export const setCollectionOrder = async (collectionuid: string, order: number) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${collectionuid}/order`,
        data: { order },
        defaultError: "Error while changing collection order",
    });
};

export const updateCollection = async (useruid: string, body: Partial<ReportCollection>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `reports/${useruid}/collectionupdate`,
        data: body,
        defaultError: "Error while updating collection",
    });
};
