import { Status } from "./ActionStatus";

export interface DataExportRecord {
    clientuid: string;
    created: string;
    objects_count: number;
    size: number;
    taskuid: string;
    type: string;
    updated: string;
    useruid: string;
}

export interface DataExportsResponse {
    records: DataExportRecord[];
    status: Status;
}
