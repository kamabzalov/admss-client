import { BaseResponseError } from "common/models/base-response";
import { QueryParams } from "common/models/query-params";
import {
    CheckPasswordResponse,
    UserData,
    UserRole,
    UserRolePayload,
    SalespersonInfo,
} from "common/models/users";
import { ApiRequest } from "http/index";

export const getUsersList = async (useruid: string, params?: QueryParams) => {
    return new ApiRequest().get({
        url: `user/${useruid}/list`,
        config: { params },
        defaultError: "Error while getting users list",
    });
};

export const getSubUsersList = async (useruid: string, params?: QueryParams) => {
    return new ApiRequest().get({
        url: `user/${useruid}/subusers`,
        config: { params },
        defaultError: "Error while getting sub users list",
    });
};

export const getUserRoles = async (useruid: string, params?: QueryParams) => {
    return new ApiRequest().get({
        url: `user/${useruid}/roles`,
        config: { params },
        defaultError: "Error while getting user roles",
    });
};

export const getUserRole = async (useruid: string) => {
    return new ApiRequest().get({
        url: `user/${useruid}/userrole`,
        defaultError: "Error while getting user role",
    });
};

export const getRoleInfo = async (roleuid: string) => {
    return new ApiRequest().get<UserRole | BaseResponseError>({
        url: `user/${roleuid}/role`,
        defaultError: "Error while getting role info",
    });
};

export const getRoleUsers = async (roleuid: string, params?: QueryParams) => {
    return new ApiRequest().get({
        url: `user/${roleuid}/roleusers`,
        config: { params },
        defaultError: "Error while getting role users",
    });
};

export const deleteUser = async (uid: string) => {
    return new ApiRequest().post({
        url: `user/${uid}/delete`,
        defaultError: "Error while deleting user",
    });
};

export const enableUser = async (uid: string) => {
    return new ApiRequest().post({
        url: `user/${uid}/enable`,
        defaultError: "Error while enabling user",
    });
};

export const disableUser = async (uid: string) => {
    return new ApiRequest().post({
        url: `user/${uid}/disable`,
        defaultError: "Error while disabling user",
    });
};

export const restoreUser = async (uid: string) => {
    return new ApiRequest().post({
        url: `user/${uid}/undelete`,
        defaultError: "Error while restoring user",
    });
};

export const setUserData = async (uid: string, userData: Partial<UserData>) => {
    return new ApiRequest().post({
        url: `user/${uid}/set`,
        data: userData,
        defaultError: "Error while setting user data",
    });
};

export const validateUserData = async (uid: string, userData: Partial<UserData>) => {
    return new ApiRequest().post({
        url: `user/${uid}/validate`,
        data: userData,
        defaultError: "Error while validating user data",
    });
};

export const validateUserDataGeneral = async (userData: any) => {
    return new ApiRequest().post({
        url: `user/validate`,
        data: userData,
        defaultError: "Error while validating user data",
    });
};

export const getUserData = async (useruid: string) => {
    return new ApiRequest().get({
        url: `user/${useruid}/userinfo`,
        defaultError: "Error while getting user data",
    });
};

export const createUser = async (dealer_id: string, userData: Partial<UserData>) => {
    return new ApiRequest().post({
        url: `user/${dealer_id}/user`,
        data: userData,
        defaultError: "Error while creating user",
    });
};

export const updateUserProfile = async (useruid: string, userData: Partial<UserData>) => {
    return new ApiRequest().post({
        url: `user/${useruid}/user`,
        data: userData,
        defaultError: "Error while updating user profile",
    });
};

export const changePassword = async (useruid: string, password: string) => {
    return new ApiRequest().post({
        url: `user/${useruid}/changepassword`,
        data: { password },
        defaultError: "Error while changing password",
    });
};

export const generateNewPassword = async (useruid: string) => {
    return new ApiRequest().get({
        url: `user/${useruid}/newpassword`,
        defaultError: "Error while generating new password",
    });
};

export const deleteUserRole = async (roleuid: string) => {
    return new ApiRequest().post({
        url: `user/${roleuid}/deleterole`,
        defaultError: "Error while deleting user role",
    });
};

export const copyUserRole = async (roleuid: string) => {
    return new ApiRequest().post({
        url: `user/${roleuid}/copyrole`,
        defaultError: "Error while copying user role",
    });
};

export const createOrUpdateRole = async (roleuid: string, roleData: UserRolePayload) => {
    return new ApiRequest().post({
        url: `user/${roleuid || 0}/role`,
        data: roleData,
        defaultError: "Error while creating or updating role",
    });
};

export const checkRoleName = async (useruid: string, rolename: string, roleuid?: string) => {
    return new ApiRequest().post<{ status: string; available: boolean } | BaseResponseError>({
        url: `user/${useruid}/check-role-name`,
        data: { rolename, ...(roleuid ? { roleuid } : {}) },
        defaultError: "Error while checking role name",
    });
};

export const checkPassword = async (useruid: string, password: string) => {
    return new ApiRequest().post<CheckPasswordResponse>({
        url: `user/${useruid}/checkpassword`,
        data: { password },
        defaultError: "Password is incorrect",
    });
};

export const getSalespersonInfo = async (useruid: string) => {
    return new ApiRequest().get<SalespersonInfo | BaseResponseError>({
        url: `user/${useruid}/salespersoninfo`,
        defaultError: "Error while getting salesperson info",
    });
};

export const updateSalespersonInfo = async (useruid: string, data: Partial<SalespersonInfo>) => {
    return new ApiRequest().post<SalespersonInfo | BaseResponseError>({
        url: `user/${useruid}/salespersoninfo`,
        data,
        defaultError: "Error while updating salesperson info",
    });
};
