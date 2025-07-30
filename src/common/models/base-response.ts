export enum Status {
    OK = "OK",
    ERROR = "ERROR",
}

export interface BaseResponse {
    status: Status;
}

interface Error {
    field: string;
    message: string;
}

export interface BaseResponseError extends BaseResponse {
    error?: string;
    errorField?: string;
    message?: string;
    errors?: Error[] | string;
}

export interface TotalListCount extends BaseResponseError {
    total: number;
}
