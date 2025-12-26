import { LoginForm } from "sign/sign-in";
import { ApiRequest, nonAuthorizedUserApiInstance } from "../index";
import { BaseResponseError } from "common/models/base-response";
import { UserPermissionsResponse } from "common/models/user";

export interface AuthUser {
    companyname: string;
    firstname: string;
    isadmin: 0 | 1;
    islocaladmin: 0 | 1;
    ismanager: 0 | 1;
    issalesperson: 0 | 1;
    lastname: string;
    loginname: string;
    locationname: string;
    locationuid: string;
    modified: string;
    sessionuid: string;
    started: string;
    status: "OK";
    token: string;
    username: string;
    useruid: string;
    permissions: UserPermissionsResponse;
}

export const auth = async ({ username, password, rememberme, application, version }: LoginForm) => {
    return new ApiRequest(nonAuthorizedUserApiInstance).post<AuthUser | BaseResponseError>({
        url: "user",
        data: {
            user: username,
            secret: password,
            rememberme,
            application,
            version,
        },
        defaultError: "Authentication failed",
    });
};

export const logout = async (useruid: string) => {
    return new ApiRequest().post({
        url: `user/${useruid}/logout`,
        defaultError: "Logout failed",
    });
};

export const checkToken = async (token: string) => {
    return new ApiRequest().get({
        url: `sites/${token}/checktoken`,
        defaultError: "Token validation failed",
    });
};
