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
