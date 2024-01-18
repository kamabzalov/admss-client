import { DataExportRecord } from "common/interfaces/DataExport";
import { fetchApiData } from "common/api/fetchAPI";
import { ActionStatus } from "common/interfaces/ActionStatus";

export const getDataExports = (useruid: string): Promise<DataExportRecord[]> => {
    return fetchApiData<DataExportRecord[]>("GET", `external/${useruid}/shared`);
};

export const exportUserDataExport = (useruid: string): Promise<ActionStatus> => {
    const data = { type: 1, useruid };
    return fetchApiData<ActionStatus>("POST", "external/0/add", { data });
};

export const deleteUserDataExport = (taskuid: string): Promise<ActionStatus> => {
    return fetchApiData<ActionStatus>("POST", `external/${taskuid}/deleteshared`);
};

export const resetUserDataExport = (taskuid: string): Promise<ActionStatus> => {
    return fetchApiData<ActionStatus>("POST", `external/${taskuid}/resetshared`);
};
