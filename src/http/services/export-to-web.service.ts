import { authorizedUserApiInstance } from "http/index";
import { QueryParams } from "common/models/query-params";
import { BaseResponse } from "common/models/base-response";
import { ExportWebList, ExportWebPostData } from "common/models/export-web";

export interface TotalExportToWebList extends BaseResponse {
    total: number;
}

export const getExportToWebList = async (useruid: string, queryParams?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<ExportWebList[] | TotalExportToWebList>(
            `inventory/${useruid}/weblist`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const addExportTask = async (useruid: string, { data, columns }: ExportWebPostData) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponse>(
            `external/${useruid}/export`,
            { data, columns, useruid }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const addExportTaskToSchedule = async (
    useruid: string,
    { data, columns }: ExportWebPostData
) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponse>(
            `external/${useruid}/schedule`,
            { data, columns, useruid }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
