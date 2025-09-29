import { AccountInfo } from "common/models/accounts";
import { ColumnProps } from "primereact/column";

export interface FilterOptions {
    label: string;
    value: string;
    column?: keyof AccountInfo | "Misc";
    bold?: boolean;
    disabled?: boolean;
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

export interface TableColumnProps extends ColumnProps {
    field: keyof AccountInfo | MissedAccountColumn;
}

export type MissedAccountColumn =
    | "Balance"
    | "CurrentDue"
    | "NextPaymentDue"
    | "EffectiveDate"
    | "PaymentsLeft"
    | "Year"
    | "Make"
    | "Model"
    | "VIN";

export const columns: TableColumnsList[] = [
    { field: "accountnumber", header: "Account#", checked: true },
    { field: "accounttype", header: "Type", checked: true },
    { field: "name", header: "Name", checked: true },
    { field: "Balance", header: "Balance", checked: true },
    { field: "CurrentDue", header: "Current Due", checked: true },
    { field: "NextPaymentDue", header: "Next Payment Due", checked: true },
    { field: "created", header: "Effective Date", checked: true },
    { field: "PaymentsLeft", header: "Payments Left", checked: true },
    { field: "Year", header: "Year", checked: false },
    { field: "Make", header: "Make", checked: false },
    { field: "Model", header: "Model", checked: false },
    { field: "VIN", header: "VIN", checked: false },
    { field: "accountstatus", header: "Status", checked: false },
];
