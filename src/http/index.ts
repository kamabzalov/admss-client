import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, isAxiosError } from "axios";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "./services/auth.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { NavigateFunction } from "react-router-dom";
import { BaseResponseError, Status } from "common/models/base-response";
import { ERROR_MESSAGES } from "common/constants/error-messages";

export const APP_TYPE: string = process.env.REACT_APP_TYPE || "client";
export const APP_VERSION: string = process.env.REACT_APP_VERSION || "0.1";
export const APP_MAGIC: string = process.env.REACT_APP_MAGIC || "avansoft";
export const APP_API_URL: string = process.env.REACT_APP_API_URL || "https://app.admss.com/api/v1/";

export let authorizedUserApiInstance: AxiosInstance;

function getToken() {
    const authUser: AuthUser = getKeyValue(LS_APP_USER);
    if (authUser) {
        return authUser.token;
    }
    return null;
}

export const nonAuthorizedUserApiInstance = axios.create({
    baseURL: APP_API_URL,
});

const handleErrorResponse = (error: AxiosError, navigate: NavigateFunction) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem("useruid");
        navigate("/");
        return Promise.reject(error.response);
    } else if (error.response && error.response.status === 500) {
        navigate("/service-update");
        return Promise.reject(error.response);
    } else {
        return Promise.reject(error);
    }
};

export function createApiDashboardInstance(navigate: NavigateFunction) {
    authorizedUserApiInstance = axios.create({
        baseURL: APP_API_URL,
        headers: {
            common: { Authorization: `Bearer ${getToken()}` },
        },
    });

    authorizedUserApiInstance.interceptors.request.use((config) => {
        if (config.params) {
            const params: URLSearchParams = new URLSearchParams();

            for (const [key, value] of Object.entries(config.params)) {
                if (value !== "" && value !== null && value !== undefined) {
                    params.append(key, value as string);
                }
            }

            config.params = params;
        }

        return config;
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

export interface ApiRequestOptions {
    url: string;
    config?: AxiosRequestConfig;
    defaultError?: string;
    returnErrorObject?: boolean;
}

export interface ApiPostOptions extends Omit<ApiRequestOptions, "config"> {
    url: string;
    data?: unknown;
    config?: AxiosRequestConfig;
    defaultError?: string;
    returnErrorObject?: boolean;
}

export class ApiRequest {
    private _returnErrorObject: boolean = true;

    constructor(private apiInstance: AxiosInstance = authorizedUserApiInstance) {}

    private handleError(
        error: unknown,
        defaultError: string,
        returnErrorObject: boolean
    ): BaseResponseError | undefined {
        if (returnErrorObject) {
            const errorMessage = isAxiosError(error)
                ? error.response?.data?.error || defaultError
                : defaultError;

            return {
                status: Status.ERROR,
                error: errorMessage,
            } as BaseResponseError;
        }

        return undefined;
    }

    async get<T = BaseResponseError>(
        options: ApiRequestOptions
    ): Promise<T | BaseResponseError | undefined> {
        const {
            url,
            config,
            defaultError = ERROR_MESSAGES.API_ERROR,
            returnErrorObject = this._returnErrorObject,
        } = options;

        try {
            const response = await this.apiInstance.get<T>(url, config);
            return response.data;
        } catch (error) {
            return this.handleError(error, defaultError, returnErrorObject);
        }
    }

    async post<T = BaseResponseError>(
        options: ApiPostOptions
    ): Promise<T | BaseResponseError | undefined> {
        const {
            url,
            data,
            config,
            defaultError = ERROR_MESSAGES.API_ERROR,
            returnErrorObject = this._returnErrorObject,
        } = options;

        try {
            const response = await this.apiInstance.post<T>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error, defaultError, returnErrorObject);
        }
    }
}
