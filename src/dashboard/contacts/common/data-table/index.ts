import { ContactUser } from "common/models/contact";
import { formatPhoneNumber } from "common/helpers";
import { TableColumn } from "dashboard/common/filter";

export interface TableColumnsList extends TableColumn {
    field: keyof ContactUser | "fullName";
}

export interface AdvancedSearch {
    [key: string]: string | number;
    username: string;
    type: number;
    phone1: string;
    phone2: string;
}

export const alwaysActiveColumns: TableColumnsList[] = [
    { field: "fullName", header: "Name", checked: true },
    { field: "phone1", header: "Work Phone", checked: true },
    { field: "created", header: "Created", checked: true },
];

export const selectableColumns: TableColumnsList[] = [
    { field: "phone2", header: "Home Phone", checked: false, isSelectable: true },
    { field: "fullAddress", header: "Address", checked: false, isSelectable: true },
    { field: "email1", header: "Email", checked: false, isSelectable: true },
];

export const renderFullName = (rowData: ContactUser): string => {
    return rowData.businessName || `${rowData.firstName} ${rowData.lastName}`;
};

export const getSortColumn = (field: string | undefined): string | undefined => {
    if (field === "fullName") {
        return "userName";
    }
    return field;
};

export const formatContactFieldValue = (
    field: keyof ContactUser | "fullName",
    rowData: ContactUser
): string => {
    switch (field) {
        case "fullName":
            return renderFullName(rowData);
        case "phone1":
        case "phone2":
            return formatPhoneNumber(rowData[field]);
        default:
            return String(rowData[field] || "");
    }
};
