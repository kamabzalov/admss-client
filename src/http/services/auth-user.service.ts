import { BaseResponse } from "common/models/base-response";
import { authorizedUserApiInstance } from "../index";

export interface ExtendedUserData extends BaseResponse {
    location: string;
    dealerName: string;
}

export interface UserSettings extends BaseResponse {
    created: string;
    profile: string;
    updated: string;
}

export const getExtendedData = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<ExtendedUserData>(`user/${uid}/info`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getUserSettings = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<UserSettings>(`user/${uid}/profile`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const setUserSettings = async (uid: string, settings: any) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`user/${uid}/profile`, {
            profile: JSON.stringify(settings),
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
