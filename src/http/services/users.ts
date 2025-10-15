import { isAxiosError } from "axios";
import { BaseResponseError, Status } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import { UserGroup } from "common/models/user";
import { GenerateNewPasswordResponse, SubUser, User, UserData } from "common/models/users";
import { authorizedUserApiInstance } from "http/index";

export const getUsersList = async (useruid: string, params?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | User[]>(
            `user/${useruid}/list`,
            { params }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting users list",
            };
        }
    }
};

export const getSubUsersList = async (useruid: string, params?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | SubUser[]>(
            `user/${useruid}/subusers`,
            { params }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting sub users list",
            };
        }
    }
};

export const getUserRoles = async (useruid: string, params?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | UserGroup[]>(
            `user/${useruid}/roles`,
            { params }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user roles",
            };
        }
    }
};

export const getUserRole = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | UserGroup>(
            `user/${useruid}/userrole`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user role",
            };
        }
    }
};

export const getRoleInfo = async (roleuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | UserGroup>(
            `user/${roleuid}/role`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting role info",
            };
        }
    }
};

export const getRoleUsers = async (roleuid: string, params?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | any>(
            `user/${roleuid}/roleusers`,
            { params }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting role users",
            };
        }
    }
};

export const deleteUser = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/delete`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting user",
            };
        }
    }
};

export const enableUser = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/enable`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while enabling user",
            };
        }
    }
};

export const disableUser = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/disable`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while disabling user",
            };
        }
    }
};

export const restoreUser = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/undelete`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while restoring user",
            };
        }
    }
};

export const setUserData = async (uid: string, userData: Partial<UserData>) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/set`,
            userData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting user data",
            };
        }
    }
};

export const validateUserData = async (uid: string, userData: Partial<UserData>) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${uid}/validate`,
            userData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while validating user data",
            };
        }
    }
};

export const validateUserDataGeneral = async (userData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/validate`,
            userData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while validating user data",
            };
        }
    }
};

export const getUserData = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | UserData>(
            `user/${useruid}/userinfo`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user data",
            };
        }
    }
};

export const createUser = async (useruid: string, userData: Partial<UserData>) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError>(
            `user/${useruid}/user`,
            userData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while creating user",
            };
        }
    }
};

export const generateNewPassword = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<GenerateNewPasswordResponse>(
            `user/${useruid}/newpassword`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while generating new password",
            };
        }
    }
};
