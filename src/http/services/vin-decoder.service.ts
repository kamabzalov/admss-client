import { authorizedUserApiInstance } from "http/index";

export interface VehicleDecodeInfo {
    BodyStyle: string;
    Category: string;
    Cylinders: string;
    Cylinders_id: number;
    DriveLine: string;
    DriveLine_id: number;
    Engine: string;
    Engine_id: number;
    ExteriorColor: string;
    GroupClass: number;
    GroupClassName: string;
    GroupClassName_uid: string;
    InteriorColor: string;
    Make: string;
    Model: string;
    Notes: string;
    Options: number;
    Status: string;
    StockNo: string;
    Transmission: string;
    Transmission_id: number;
    Trim: string;
    TypeOfFuel: string;
    TypeOfFuel_id: number;
    VIN: string;
    Year: string;
    mileage: string;
    options_codes: string[];
    options_info: string[];
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
