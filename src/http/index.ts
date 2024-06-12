import axios, { AxiosInstance } from "axios";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "./services/auth.service";
import { LS_APP_USER } from "common/constants/localStorage";

export const API_URL = "https://app.admss.com/api/v1/";
export const MAGIC: string = "avansoft";
export const APPLICATION: string = "app";

export let authorizedUserApiInstance: AxiosInstance;

function getToken() {
    const authUser: AuthUser = getKeyValue(LS_APP_USER);
    if (authUser) {
        return authUser.token;
    }
    return null;
}

export const nonAuthorizedUserApiInstance = axios.create({
    baseURL: API_URL,
});

const handleErrorResponse = (error: any, navigate: any) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem("useruid");
        navigate("/");
        return Promise.reject(error.response);
    } else {
        return Promise.reject(error);
    }
};

export function createApiDashboardInstance(navigate: any) {
    authorizedUserApiInstance = axios.create({
        baseURL: API_URL,
        headers: {
            common: { Authorization: `Bearer ${getToken()}` },
        },
    });
    authorizedUserApiInstance.interceptors.response.use(
        (response) => {
            if (response.status === 200) {
                return response;
            } else {
                return Promise.reject({ messages: response.statusText });
            }
        },
        (error) => handleErrorResponse(error, navigate)
    );
}
