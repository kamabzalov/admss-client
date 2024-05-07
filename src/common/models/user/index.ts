import { FilterOptions, TableColumnsList } from "dashboard/inventory/common/data-table";
import { DataTableState } from "primereact/datatable";
import { ContactType } from "../contact";

interface ColumnWidth {
    [key: string]: number;
}

export interface TableState extends DataTableState {
    page: number;
    column: string;
}

interface UserSettings {
    activeColumns?: any[];
    columnWidth?: ColumnWidth;
    table?: TableState;
}

export interface InventoryUserSettings extends UserSettings {
    activeColumns?: string[];
    selectedFilterOptions?: FilterOptions[];
    selectedInventoryType: string[];
}

export interface ContactsUserSettings extends UserSettings {
    selectedCategoriesOptions?: ContactType[];
}

export interface ExportWebUserSettings extends UserSettings {}

export interface ServerUserSettings {
    inventory: InventoryUserSettings;
    contacts: ContactsUserSettings;
    exportWeb: ExportWebUserSettings;
}

export interface UserGroup {
    created: string;
    description: string;
    itemuid: string;
    updated: string;
    useruid: string;
    enabled: 0 | 1;
}
