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
