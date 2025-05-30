import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SalespersonsList } from "common/models/contact";
import { DataTableRowClickEvent } from "primereact/datatable";
import { useState, useEffect } from "react";
import { useStore } from "store/hooks";
import { getContactsSalesmanList } from "http/services/contacts-service";
import "./index.css";

interface SalespersonsDataTableProps {
    onRowClick?: (username: string) => void;
    getFullInfo?: (salesperson: SalespersonsList) => void;
}

const renderColumns = [
    { field: "username", header: "Username" },
    { field: "useruid", header: "User ID" },
    { field: "creatorusername", header: "Created By" },
    { field: "createdbyuid", header: "Created By ID" },
    { field: "created", header: "Created" },
];

export const SalespersonsDataTable = ({ onRowClick, getFullInfo }: SalespersonsDataTableProps) => {
    const [salespersons, setSalespersons] = useState<SalespersonsList[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { authUser } = useStore().userStore;

    useEffect(() => {
        if (authUser) {
            setIsLoading(true);
            getContactsSalesmanList(authUser.useruid).then((response) => {
                if (response?.length) {
                    setSalespersons(response);
                } else {
                    setSalespersons([]);
                }
                setIsLoading(false);
            });
        }
    }, [authUser]);

    const handleOnRowClick = ({ data }: DataTableRowClickEvent) => {
        const salesperson = data as SalespersonsList;
        if (onRowClick) {
            onRowClick(salesperson.username);
        }
        if (getFullInfo) {
            getFullInfo(salesperson);
        }
    };

    const statusBodyTemplate = (rowData: SalespersonsList) => {
        return rowData.enabled === 1 ? "Active" : "Inactive";
    };

    return (
        <DataTable
            value={salespersons}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            tableStyle={{ minWidth: "50rem" }}
            loading={isLoading}
            onRowClick={handleOnRowClick}
            selectionMode='single'
            className='p-datatable-sm salespersons-table'
        >
            {renderColumns.map((col) => (
                <Column
                    headerClassName='salespersons-column-header'
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    body={col.field === "enabled" ? statusBodyTemplate : undefined}
                />
            ))}
        </DataTable>
    );
};
