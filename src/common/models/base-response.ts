/* eslint-disable no-unused-vars */

export enum Status {
    OK = "OK",
    ERROR = "ERROR",
}

export interface BaseResponse {
    status: Status;
}

export interface BaseResponseError extends BaseResponse {
    error?: string;
    message?: string;
}
