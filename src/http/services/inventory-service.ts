import { BaseResponse } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";

export interface Inventory {
    BodyStyle: string;
    Category: string;
    Cylinders: string;
    DriveLine: string;
    Engine: string;
    ExteriorColor: string;
    GroupClass: string;
    InteriorColor: string;
    Make: string;
    Model: string;
    Notes: string;
    Options: number;
    Status: string;
    StockNo: string;
    Transmission: string;
    TypeOfFuel: string;
    VIN: string;
    VINimageUID: string;
    Year: string;
    created: string;
    itemuid: string;
    mileage: number;
    name: string;
    updated: string;
    useruid: string;
}

export interface TotalInventoryList extends BaseResponse {
    total: number;
}

export const getInventoryList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<Inventory[] | TotalInventoryList>(
            `inventory/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
