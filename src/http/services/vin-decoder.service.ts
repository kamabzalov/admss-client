import { Status } from "common/models/base-response";
import { authorizedUserApiInstance } from "http/index";

interface VehicleDecodeInfo {
    BodyStyle: string;
    Category: string;
    Cylinders: string;
    DriveLine: string;
    Engine: string;
    ExteriorColor: string;
    GroupClass: number;
    GroupClassName: string;
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
    Year: string;
    data: {
        Count: number;
        Message: string;
        Results: {
            Value: string | null;
            ValueId: string | null;
            Variable: string;
            VariableId: number;
        }[];
        SearchCriteria: string;
        status: string;
        statuscode: number;
    };
    mileage: number;
    options_codes: unknown; // You may need to define a specific type for this array
    options_info: unknown; // You may need to define a specific type for this array
    trim: string;
}

export const inventoryDecodeVIN = async (vin: string): Promise<VehicleDecodeInfo | undefined> => {
    try {
        const request = await authorizedUserApiInstance.get<VehicleDecodeInfo>(
            `decoder/${vin}/vindecode`
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};
