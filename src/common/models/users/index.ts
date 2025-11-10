import { BaseResponseError } from "common/models/base-response";
import { TypeList } from "common/models";
import { UserPermissionsResponse } from "../user";

export interface User extends BaseResponseError {
    index: number;
    created: string;
    updated: string;
    deleted: string;
    enabled: 0 | 1;
    username: string;
    useruid: string;
    parentuid: string;
    createdbyuid: string;
    isadmin: 0 | 1;
    isclientadmin: 0 | 1;
    parentusername: string;
    creatorusername: string;
    type: string;
    deletedbyuid: string;
    deletedbyname: string;
    deletereason: string;
    issubuser: 0 | 1;
}

export interface SubUser extends BaseResponseError {
    created: string;
    createdbyuid: string;
    creatorusername: string;
    enabled?: 0 | 1;
    rolename: string;
    roleuid: string;
    updated: string;
    username: string;
    useruid: string;
}

export interface GenerateNewPasswordResponse extends BaseResponseError {
    created: string;
    mode: string;
    password: string;
    useruid: string;
}

export interface UserData extends BaseResponseError {
    ZIP: string;
    canaddcontacts: 0 | 1;
    canaddinventory: 0 | 1;
    canbackpayments: 0 | 1;
    cancreatereports: 0 | 1;
    candeleteaccounts: 0 | 1;
    candeletecontacts: 0 | 1;
    candeleteinventory: 0 | 1;
    candeleteinventorymedia: 0 | 1;
    caneditaccounts: 0 | 1;
    caneditcontacts: 0 | 1;
    caneditdeals: 0 | 1;
    caneditinventory: 0 | 1;
    caneditpayments: 0 | 1;
    canpartialpayments: 0 | 1;
    canundeletedeleted: 0 | 1;
    canviewaccounts: 0 | 1;
    canviewcontacts: 0 | 1;
    canviewdeals: 0 | 1;
    canviewdeleted: 0 | 1;
    canviewinventory: 0 | 1;
    canviewreports: 0 | 1;
    city: string;
    companyName: string;
    created: string;
    email1: string;
    email2: string;
    firstName: string;
    index: number;
    middleName: string;
    lastName: string;
    locations: any;
    loginName: string;
    messager1: string;
    messager2: string;
    parentuid: string;
    phone1: string;
    phone2: string;
    rolename: string;
    roleuid: string;
    state: string;
    streetAddress: string;
    updated: string;
    userName: string;
    useruid: string;
}

export interface Permission extends TypeList {
    name: keyof UserPermissionsResponse;
    description: string;
}

export interface UserRole {
    created: string;
    deleted: string;
    isDefault: 0 | 1;
    permissions: (Permission | null)[];
    rolename: string;
    roleuid: string;
    updated: string;
    useruid: string;
}
