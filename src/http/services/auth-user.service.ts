import { BaseResponse, BaseResponseError, Status } from "common/models/base-response";
import { ServerUserSettings, UserGroup, UserPermissionsResponse } from "common/models/user";
import { InventoryLocations } from "common/models/inventory";
import { ApiRequest } from "http/index";

export interface ExtendedUserData extends BaseResponse {
    locations: InventoryLocations[];
    dealerName: string;
}

export interface UserSettings extends BaseResponse {
    created: string;
    profile: string;
    updated: string;
}

export const getExtendedData = async (uid: string): Promise<ExtendedUserData | undefined> => {
    const response = await new ApiRequest().get<ExtendedUserData>({
        url: `user/${uid}/info`,
        defaultError: "Error while getting extended user data",
    });

    if (!response || (response as BaseResponseError).status === Status.ERROR) {
        return undefined;
    }

    return response as ExtendedUserData;
};

export const getUserSettings = async (uid: string): Promise<UserSettings | undefined> => {
    const response = await new ApiRequest().get<UserSettings>({
        url: `user/${uid}/profile`,
        defaultError: "Error while getting user settings",
    });

    if (!response || (response as BaseResponseError).status === Status.ERROR) {
        return undefined;
    }

    return response as UserSettings;
};

export const setUserSettings = async (
    uid: string,
    settings: Partial<ServerUserSettings>
): Promise<BaseResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse | BaseResponseError>({
        url: `user/${uid}/profile`,
        data: { profile: JSON.stringify(settings) },
        defaultError: "Error while setting user settings",
    });
};

export const getUserGroupList = async (uid: string): Promise<UserGroup[] | undefined> => {
    const response = await new ApiRequest().get<UserGroup[]>({
        url: `user/${uid}/grouplist`,
        defaultError: "Error while getting user group list",
    });

    if (!response || (response as BaseResponseError).status === Status.ERROR) {
        return undefined;
    }

    return response as UserGroup[];
};

export const getUserGroupActiveList = async (uid: string): Promise<UserGroup[] | undefined> => {
    const response = await new ApiRequest().get<UserGroup[]>({
        url: `user/${uid}/grouplistactive`,
        defaultError: "Error while getting active user group list",
    });

    if (!response || (response as BaseResponseError).status === Status.ERROR) {
        return undefined;
    }

    return response as UserGroup[];
};

export const addUserGroupList = async (
    uid: string,
    { description, enabled, itemuid, order, isdefault }: Partial<UserGroup>
): Promise<BaseResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<BaseResponse | BaseResponseError>({
        url: `user/${uid}/grouplist`,
        data: {
            description,
            enabled,
            itemuid,
            order,
            isdefault,
        },
        defaultError: "Error while creating user inventory group",
    });
};

export const deleteUserGroupList = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponse | BaseResponseError>({
        url: `user/${itemuid}/deletegroup`,
        defaultError: "Error while deleting user inventory group",
    });
};

export const getUserPermissions = async (
    uid: string
): Promise<Partial<UserPermissionsResponse> | undefined> => {
    const response = await new ApiRequest().get<Partial<UserPermissionsResponse>>({
        url: `user/${uid}/permissions`,
        defaultError: "Error while getting user permissions",
    });

    if (!response || (response as BaseResponseError).status === Status.ERROR) {
        return undefined;
    }

    return response as Partial<UserPermissionsResponse>;
};
