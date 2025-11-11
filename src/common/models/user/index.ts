import { FilterOptions } from "dashboard/inventory/common/data-table";
import { DataTableState } from "primereact/datatable";
import { ContactType } from "../contact";
import { BaseResponseError } from "../base-response";
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

export interface DealsUserSettings extends UserSettings {
    activeColumns?: string[];
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
    deals?: DealsUserSettings;
    exportWeb: ExportWebUserSettings;
    exportSchedule: ExportWebUserSettings;
    exportHistory: ExportWebUserSettings;
    sidebar?: SidebarUserSettings;
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

export type UserPermissionsResponse = BaseResponseError & {
    [K in PermissionKey]: 0 | 1;
};
