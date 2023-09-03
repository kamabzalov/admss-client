import { LoginForm } from "../../sign/sign-in";
import { authorizedUserApiInstance, MAGIC, nonAuthorizedUserApiInstance } from "../index";

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
        authorizedUserApiInstance.post(`user/${uid}/logout`);
        return true;
    } catch (error) {
        // TODO: add error handler
    }
};
