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

