import { BaseResponseError, Status } from "../base-response";

export interface ReportsColumn {
    name: string;
    data: string;
}

export interface ReportsPostData {
    itemUID?: string;
    data?: Record<string, string>[];
    format?: string;
    columns?: ReportsColumn[];
}

export interface ReportDocument {
    accessed: string;
    count: number;
    created: string;
    documentUID: string;
    index: number;
    isfavorite: 0 | 1;
    itemUID: string;
    name: string;
    updated: string;
}

export interface ReportCollection {
    accessed: string;
    created: string;
    description: string;
    documents: ReportDocument[];
    index: number;
    isfavorite: 0 | 1;
    itemUID: string;
    name: string;
    updated: string;
    userUID: string;
}

export interface ReportAccess {
    granted: 0 | 1;
    created: string;
    updated: string;
    enabled: 0 | 1;
    itemuid: string;
    useruid: string;
    username: string;
}

export interface ReportACL {
    status: string;
    error: string;
    info: string;
    message: string;
    useruid: string;
    username: string;
    reportuid: string;
    acl: ReportAccess;
}

export interface ReportInfo extends BaseResponseError {
    message: string;
    created: string;
    updated: string;
    itemuid: string;
    useruid: string;
    name: string;
    isfavorite: 0 | 1;
    ShowTotals: 0 | 1;
    ShowAverages: 0 | 1;
    ShowLineCount: 0 | 1;
    AskForStartAndEndDates: 0 | 1;
    listid: 0 | 1;
}

export interface ReportCreate extends BaseResponseError {
    info: string;
    name: string;
    version: string;
    description: string;
}
