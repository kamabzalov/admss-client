import { BaseResponseError } from "common/models/base-response";

export interface User extends BaseResponseError {
    index: number;
    created: string;
    updated: string;
    deleted: string;
    enabled: 0 | 1;
    username: string;
    useruid: string;
    parentuid: string;
    createdbyuid: string;
    isadmin: 0 | 1;
    isclientadmin: 0 | 1;
    parentusername: string;
    creatorusername: string;
    type: string;
    deletedbyuid: string;
    deletedbyname: string;
    deletereason: string;
    issubuser: 0 | 1;
}

export interface SubUser extends BaseResponseError {
    created: string;
    createdbyuid: string;
    creatorusername: string;
    enabled?: 0 | 1;
    rolename: string;
    roleuid: string;
    updated: string;
    username: string;
    useruid: string;
}

export interface GenerateNewPasswordResponse extends BaseResponseError {
    created: string;
    mode: string;
    password: string;
    useruid: string;
}

export interface UserData extends BaseResponseError {
    clientuid: string;
    created: string;
    createdbyuseruid: string;
    creatorusername: string;
    enabled: 0 | 1;
    parentname: string;
    parentuid: string;
    username: string;
    useruid: string;
}
