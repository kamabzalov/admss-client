import { DashboardDialog } from "dashboard/common/dialog";
import { DialogProps } from "primereact/dialog";
import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import { DataTable, DataTableExpandedRows, DataTableRowClickEvent } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { SupportHistory, getSupportMessages } from "http/services/support.service";
import { useStore } from "store/hooks";

interface SupportContactDialogProps extends DialogProps {
    useruid: string;
}

export const SupportHistoryDialog = ({
    visible,
    onHide,
    useruid,
}: SupportContactDialogProps): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [supportHistoryData, setSupportHistoryData] = useState<SupportHistory[]>([]);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows[]>([]);

    useEffect(() => {
        if (authUser && visible) {
            getSupportMessages(useruid).then((response) => {
                if (Array.isArray(response)) setSupportHistoryData(response);
            });
        }
    }, [useruid, visible]);

    const rowExpansionTemplate = (data: SupportHistory) => {
        return <div className='datatable-hidden'>{data.message}</div>;
    };

    const handleRowClick = (e: DataTableRowClickEvent) => {
        setExpandedRows([e.data]);
    };
    interface TableColumnProps extends ColumnProps {
        field: keyof SupportHistory;
    }

    const renderColumnsData: Pick<TableColumnProps, "header" | "field">[] = [
        { field: "username", header: "From" },
        { field: "topic", header: "Theme" },
        { field: "created", header: "Date" },
    ];

    return (
        <DashboardDialog
            className='dialog__contact-support history-support'
            header='Support history'
            visible={visible}
            onHide={onHide}
        >
            <DataTable
                showGridlines
                value={supportHistoryData}
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                onRowClick={handleRowClick}
                rowHover
                reorderableColumns
                resizableColumns
                emptyMessage='No messages found'
            >
                {renderColumnsData?.map(({ field, header }) => (
                    <Column
                        field={field}
                        header={header}
                        key={field}
                        headerClassName='cursor-move'
                    />
                ))}
            </DataTable>
        </DashboardDialog>
    );
};
