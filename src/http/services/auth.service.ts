import { LoginForm } from "sign/sign-in";
import {
    APPLICATION,
    authorizedUserApiInstance,
    // MAGIC,
    nonAuthorizedUserApiInstance,
} from "../index";
import { BaseResponse } from "common/models/base-response";

export interface AppError {
    status: "Error";
    error?: string;
    message?: string;
}

export interface AuthUser {
    companyname: string;
    firstname: string;
    isadmin: 0 | 1;
    islocaladmin: 0 | 1;
    ismanager: 0 | 1;
    issalesperson: 0 | 1;
    lastname: string;
    loginname: string;
    modified: string;
    sessionuid: string;
    started: string;
    status: "OK";
    token: string;
    username: string;
    useruid: string;
}

export const auth = async (signData: LoginForm): Promise<AuthUser | AppError> => {
    const response = await nonAuthorizedUserApiInstance
        .post<AuthUser | AppError>("user", {
            user: signData.username,
            secret: signData.password,
            rememberme: signData.rememberme,
            application: APPLICATION,
            // magic: MAGIC,
        })
        .then((response) => {
            localStorage.setItem("useruid", JSON.stringify(response.data));
            return response.data;
        })
        .catch((err) => {
            return err?.response?.data || err.message;
        });
    return response;
};

export const logout = async (uid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(`user/${uid}/logout`);
        return response.data;
    } catch (error) {
        // TODO: add error handler
    }
};
