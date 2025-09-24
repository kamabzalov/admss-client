import { ReportsColumn, ReportsPostData } from "common/models/reports";
import { makeShortReports } from "http/services/reports.service";

interface ColumnWidthEntry {
    field: string;
    width: number;
}

export type ColumnDef<T> = {
    field: keyof T extends string ? keyof T : string;
    header: string | number;
};

interface CreateReportInput<T> {
    userId: string;
    items: T[];
    columns: ColumnDef<T>[];
    widths: ColumnWidthEntry[];
    print?: boolean;
    name?: string;
    itemUID?: string;
    format?: string;
    valueFormatter?: (value: unknown, key: string, item: T) => string;
}

export const useCreateReport = <T>() => {
    const buildColumns = (columns: ColumnDef<T>[], columnWidths: ColumnWidthEntry[]) => {
        return columns.map((column) => ({
            name: String(column.header),
            data: String(column.field),
            width: columnWidths.find((width) => width.field === column.field)?.width || 0,
        })) as (ReportsColumn & { width: number })[];
    };

    const generateName = (prefix: string) => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${prefix}_${month}-${day}-${year}_${hours}-${minutes}`;
    };

    const shapeData = (
        items: T[],
        reportColumns: Array<{ name: string; data: string; width: number }>,
        formatValue?: (value: unknown, key: string, item: T) => string
    ): Record<string, string>[] => {
        return items.map((item) => {
            const shaped: Record<string, string> = {};
            reportColumns.forEach((column) => {
                const raw = (item as unknown as Record<string, unknown>)[column.data];
                shaped[column.data] = formatValue
                    ? formatValue(raw, column.data, item)
                    : raw == null
                      ? ""
                      : String(raw);
            });
            return shaped;
        });
    };

    const downloadOrPrint = (blobData: BlobPart, reportName: string, shouldPrint?: boolean) => {
        const blob = new Blob([blobData], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        if (!shouldPrint) {
            link.download = `Report-${reportName}.pdf`;
            link.click();
            return;
        }
        window.open(
            link.href,
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
        );
    };

    const createReport = async ({
        userId,
        items,
        columns,
        widths,
        print,
        name,
        itemUID = "0",
        format = "",
        valueFormatter,
    }: CreateReportInput<T>) => {
        const reportColumns = buildColumns(columns, widths);
        const reportName = generateName(name || "report");
        const reportData = shapeData(items, reportColumns, valueFormatter);
        const payload: ReportsPostData = {
            itemUID,
            data: reportData,
            columns: reportColumns,
            format,
        };
        const response = await makeShortReports(userId, payload);
        downloadOrPrint(response, reportName, print);
    };

    return { createReport };
};
