import { FilterOptions } from "dashboard/inventory/common/data-table";
import { DataTableState } from "primereact/datatable";
import { ContactType } from "common/models/contact";
import { BaseResponseError, Status } from "common/models/base-response";
import { PermissionKey } from "common/constants/permissions";

interface ColumnWidth {
    [key: string]: number;
}

export interface TableState extends DataTableState {
    page: number;
    column: string;
}

export interface UserSettings {
    activeColumns?: any[];
    columnWidth?: ColumnWidth;
    table?: TableState;
}

export interface InventoryUserSettings extends UserSettings {
    activeColumns?: string[];
    currentLocation?: string;
    selectedFilterOptions?: FilterOptions[];
    selectedInventoryType: string[];
}

export interface ContactsUserSettings extends UserSettings {
    selectedCategoriesOptions?: ContactType[];
}

export interface ExportWebUserSettings extends UserSettings {
    selectedFilterOptions?: FilterOptions[] | any;
}

export interface AccountsUserSettings extends UserSettings {
    activeColumns?: string[];
}

export interface AccountsAuditUserSettings extends UserSettings {
    selectedAuditType?: number;
}

export interface DealsUserSettings extends UserSettings {
    activeColumns?: string[];
}

export interface TasksUserSettings extends UserSettings {
    activeColumns?: string[];
}

export interface ReportsUserSettings {
    scrollTop?: number;
    expandedKeys?: { [key: string]: boolean };
    columnSelectHintViewed?: boolean;
}

export interface SidebarUserSettings {
    isSidebarCollapsed: boolean;
}

export interface UsersUserSettings extends UserSettings {}

export interface ServerUserSettings {
    inventory: InventoryUserSettings;
    contacts: ContactsUserSettings;
    users?: UsersUserSettings;
    accounts?: AccountsUserSettings;
    accountsAudit?: AccountsAuditUserSettings;
    deals?: DealsUserSettings;
    tasks?: TasksUserSettings;
    exportWeb: ExportWebUserSettings;
    exportSchedule: ExportWebUserSettings;
    exportHistory: ExportWebUserSettings;
    sidebar?: SidebarUserSettings;
    reports?: ReportsUserSettings;
}

export interface UserGroup {
    created: string;
    description: string;
    itemuid: string;
    updated: string;
    useruid: string;
    enabled: 0 | 1;
    order: number;
    isdefault: 0 | 1;
}

export interface AuthUser {
    "2fasessionuid": string;
    companyname: string;
    dealer_id: string;
    device_trust_days: number;
    device_trusted: boolean;
    expires_in: number;
    firstname: string;
    is_super_admin: boolean;
    isadmin: 0 | 1;
    islocaladmin: 0 | 1;
    ismanager: 0 | 1;
    issalesperson: 0 | 1;
    iswebsiteadmin: 0 | 1;
    lastname: string;
    locationname: string;
    locationuid: string;
    loginname: string;
    middlename: string;
    permissions: UserPermissionsResponse;
    sandbox_mode: boolean;
    sessionuid: string;
    status: "OK";
    token: string;
    token_type: string;
    username: string;
    useruid: string;
    modified?: string;
    started?: string;
    trusted_until?: number;
}

export enum TWO_FACTOR_METHOD {
    SMS = "sms",
    EMAIL = "email",
}

export const TFA_SESSION_UID_KEY = "2fasessionuid" as const;

export const TFA_REQUIRED_KEY = "tfa_required" as const;

export interface AuthResponseTfaRequired {
    status: Status.OK;
    [TFA_REQUIRED_KEY]?: boolean;
    [TFA_SESSION_UID_KEY]?: string;
}

export function isAuthResponseTfaRequired(response: unknown): response is AuthResponseTfaRequired {
    if (!response || typeof response !== "object") return false;
    const responseData = response as Record<string, unknown>;
    return (
        responseData.status === Status.OK &&
        (responseData[TFA_REQUIRED_KEY] === true || !!responseData[TFA_SESSION_UID_KEY])
    );
}

export function getTfaSessionUid(response: unknown): string | undefined {
    if (!response || typeof response !== "object") return undefined;
    const value = (response as Record<string, unknown>)[TFA_SESSION_UID_KEY];
    return typeof value === "string" && value ? value : undefined;
}

export interface TwoFactorCheckResponse {
    required: boolean;
    tfa_required?: boolean;
    phone_masked?: string;
    email_masked?: string;
    tfa_method?: TWO_FACTOR_METHOD;
    trusted_until?: number;
    trust_expires_in?: number;
    trusted_device?: boolean;
}

export interface TwoFASetupResponse {
    "2fasessionuid": string;
    phone_masked?: string;
    email_masked?: string;
    expires_in: number;
    backup_codes?: string[];
}

export interface TwoFAVerifyResponse {
    verification_token: string;
    expires_in: number;
    backup_codes?: string[];
}

export interface TwoFactorCheckRequest {
    user: string;
    deviceuid: string;
}

export interface TwoFactorSetupRequest {
    user?: string;
    method: TWO_FACTOR_METHOD;
    phone?: string;
    email?: string;
    "2fasessionuid"?: string;
}

export interface TwoFactorVerifyRequest {
    "2fasessionuid": string;
    code: string;
}

export interface TwoFactorResendRequest {
    "2fasessionuid": string;
    method: TWO_FACTOR_METHOD;
}

export interface TwoFactorPreferenceRequest {
    preferred_method: TWO_FACTOR_METHOD;
}

export interface TwoFactorTrustedDeviceRemoveRequest {
    deviceuid: string;
}

export interface TwoFactorElevateRequest {
    code: string;
}

export interface TwoFactorCheckEndpointRequest {
    method: "GET" | "POST" | string;
    endpoint: string;
}

export type UserPermissionsResponse = BaseResponseError & {
    [K in PermissionKey]: 0 | 1;
};
