import { LoginForm } from "sign/sign-in";
import { authorizedUserApiInstance, MAGIC, nonAuthorizedUserApiInstance } from "../index";
import { BaseResponse } from "common/models/base-response";

export interface AuthUser {
    modified: string;
    sessionuid: string;
    started: string;
    status: "OK";
    token: string;
    useruid: string;
}

export const auth = async (signData: LoginForm) => {
    try {
        const response = await nonAuthorizedUserApiInstance.post<AuthUser>("user", {
            user: signData.username,
            secret: signData.password,
            rememberme: signData.rememberme,
            magic: MAGIC,
        });
        return response.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const logout = async (uid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(`user/${uid}/logout`);
        return response.data;
    } catch (error) {
        // TODO: add error handler
    }
};
