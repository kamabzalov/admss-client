import { Task } from "common/models/tasks";
import { FilterOptions } from "dashboard/common/filter";
import { ColumnProps } from "primereact/column";

export interface TableColumnProps extends ColumnProps {
    field: keyof Task;
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

export const tasksFilterOptions: FilterOptions[] = [
    { label: "Default", value: "default", column: "status" },
    { label: "Started", value: "started", column: "status" },
    { label: "In Progress", value: "inProgress", column: "status" },
    { label: "Cancelled", value: "cancelled", column: "status" },
    { label: "Postponed", value: "postponed", column: "status" },
    { label: "Paused", value: "paused", column: "status" },
    { label: "Completed", value: "completed", column: "status" },
    { label: "Outdated", value: "outdated", column: "status" },
    { label: "Deleted", value: "deleted", column: "status" },
];
