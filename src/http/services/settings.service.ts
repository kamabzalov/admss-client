import { isAxiosError } from "axios";
import { Status } from "common/models/base-response";
import { GeneralSettings } from "common/models/general-settings";
import { authorizedUserApiInstance } from "http/index";

export const getUserGeneralSettings = async () => {
    try {
        const request = await authorizedUserApiInstance.get<GeneralSettings>(`user/settings`);
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user general settings",
            };
        }
    }
};

export const updateUserGeneralSettings = async (body?: Partial<GeneralSettings>) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`user/settings`, body);
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while updating user general settings",
            };
        }
    }
};

export const getWatermark = async (mediauid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<any>(`media/${mediauid}/watermark`);
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting watermark",
            };
        }
    }
};

export const updateWatermark = async (mediauid: string, body?: any) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(
            `media/${mediauid}/watermark`,
            body
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while updating watermark",
            };
        }
    }
};
