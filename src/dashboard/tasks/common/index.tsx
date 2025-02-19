import { Task, TaskStatus } from "common/models/tasks";
import { FilterOptions } from "dashboard/common/filter";
import { Chip } from "primereact/chip";
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

export const renderTaskStatus = (task_status: TaskStatus) => {
    switch (task_status) {
        case TaskStatus.IN_PROGRESS:
            return (
                <Chip
                    label={TaskStatus.IN_PROGRESS}
                    className='tasks-widget__chip task-status--in-progress'
                />
            );
        case TaskStatus.PAUSED:
            return (
                <Chip
                    label={TaskStatus.PAUSED}
                    className='tasks-widget__chip task-status--paused'
                />
            );
        case TaskStatus.POSTPONED:
            return (
                <Chip
                    label={TaskStatus.POSTPONED}
                    className='tasks-widget__chip task-status--postponed'
                />
            );
    }
};
