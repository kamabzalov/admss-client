import { authorizedUserApiInstance } from "../index";

export interface ExtendedUserData {
    location: string;
    dealerName: string;
    status: "OK";
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
        const request = await authorizedUserApiInstance.get<any>(`user/${uid}/profile`);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const setUserSettings = async (uid: string, settings: any) => {
    try {
        const request = await authorizedUserApiInstance.post<any>(`user/${uid}/profile`, settings);
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};
