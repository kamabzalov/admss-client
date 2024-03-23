import { DataTableState } from "primereact/datatable";

interface ActiveColumn {
    field: string;
    header: string;
    checked: boolean;
}

interface ColumnWidth {
    [key: string]: number;
}

interface SelectedFilterOption {
    label: string;
    column: string;
    value: string;
}

interface TableState extends DataTableState {
    first: number;
    rows: number;
    sortField: string;
    page: number;
    pageCount: number;
}

export interface InventoryUserSettings {
    activeColumns?: ActiveColumn[];
    columnWidth?: ColumnWidth;
    selectedFilterOptions?: SelectedFilterOption[];
    table?: TableState;
}
