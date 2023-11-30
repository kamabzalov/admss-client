import axios, { AxiosInstance } from "axios";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "./services/auth.service";

export const API_URL = "https://app.admss.com/api/v1/";
export const MAGIC: string = "avansoft";
export const APPLICATION: string = "app";

export let authorizedUserApiInstance: AxiosInstance;

function getToken() {
    const authUser: AuthUser = getKeyValue("admss-client-app-user");
    if (authUser) {
        return authUser.token;
    }
    return null;
}

export const nonAuthorizedUserApiInstance = axios.create({
    baseURL: API_URL,
});

export function createApiDashboardInstance() {
    authorizedUserApiInstance = axios.create({
        baseURL: API_URL,
        headers: {
            common: { Authorization: `Bearer ${getToken()}` },
        },
    });
}
