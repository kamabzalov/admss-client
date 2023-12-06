import { DashboardDialog } from "dashboard/common/dialog";
import { DialogProps } from "primereact/dialog";
import "./index.css";
import { useState } from "react";
import { DataTable, DataTableExpandedRows, DataTableRowClickEvent } from "primereact/datatable";
import { Column } from "primereact/column";

const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
};

interface SupportHistory {
    from: string;
    theme: string;
    date: string;
    body: string;
}

const supportHistoryDummy = [
    {
        from: "Support team",
        theme: "Empty tables",
        date: formatDate(new Date()),
        body: "The last time i saved the file it was allright so i probably did something wrong but i dont know where to search",
    },
    {
        from: "Support team",
        theme: "Empty tables2",
        date: formatDate(new Date()),
        body: "AGAIN!!! The last time i saved the file it was allright so i probably did something wrong but i dont know where to search",
    },
    {
        from: "Someone",
        theme: "Tables placeholder",
        date: formatDate(new Date()),
        body: "very dark table, i don't know where to search for this file",
    },
];

export const SupportHistoryDialog = ({ visible, onHide }: DialogProps): JSX.Element => {
    const [supportHistoryData] = useState<SupportHistory[]>(supportHistoryDummy);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows[]>([]);

    const rowExpansionTemplate = (data: SupportHistory) => {
        return <div className='datatable-hidden'>{data.body}</div>;
    };

    const handleRowClick = (e: DataTableRowClickEvent) => {
        setExpandedRows([e.data]);
    };

    return (
        <DashboardDialog
            className='dialog__contact-support history-support'
            header='Support history'
            visible={visible}
            onHide={onHide}
        >
            <DataTable
                value={supportHistoryData}
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                onRowClick={handleRowClick}
                rowHover
            >
                <Column header='From' field='from' />
                <Column header='Theme' field='theme' />
                <Column header='Date' field='date' />
            </DataTable>
        </DashboardDialog>
    );
};
