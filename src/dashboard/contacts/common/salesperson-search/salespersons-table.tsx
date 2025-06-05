import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SalespersonsList } from "common/models/contact";
import { DataTableRowClickEvent, DataTablePageEvent } from "primereact/datatable";
import { useState, useEffect } from "react";
import { useStore } from "store/hooks";
import { getContactsSalesmanList } from "http/services/contacts-service";
import { ROWS_PER_PAGE } from "common/settings";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";

interface SalespersonsDataTableProps {
    onRowClick?: (username: string) => void;
    getFullInfo?: (salesperson: SalespersonsList) => void;
}

const renderColumns = [
    { field: "username", header: "Name" },
    { field: "WorkPhone", header: "Work Phone" },
    { field: "HomePhone", header: "Home Phone" },
    { field: "Address", header: "Address" },
    { field: "email", header: "E-mail" },
    { field: "created", header: "Created" },
];

export const SalespersonsDataTable = ({ onRowClick, getFullInfo }: SalespersonsDataTableProps) => {
    const [salespersons, setSalespersons] = useState<SalespersonsList[]>([]);
    const { authUser } = useStore().userStore;
    const [totalRecords, setTotalRecords] = useState<number>(1);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    useEffect(() => {
        if (authUser) {
            getContactsSalesmanList(authUser.useruid).then((response) => {
                if (response && Array.isArray(response)) {
                    setSalespersons(response);
                    setTotalRecords(response.length);
                } else {
                    setSalespersons([]);
                    setTotalRecords(0);
                }
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

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    return (
        <DataTable
            value={salespersons}
            paginator
            first={lazyState.first}
            rows={lazyState.rows}
            rowsPerPageOptions={ROWS_PER_PAGE}
            tableStyle={{ minWidth: "50rem" }}
            onRowClick={handleOnRowClick}
            className='p-datatable-sm'
            totalRecords={totalRecords || 1}
            showGridlines
            scrollable
            scrollHeight='70vh'
            rowClassName={() => "hover:text-primary cursor-pointer"}
            onPage={pageChanged}
        >
            {renderColumns.map((col) => (
                <Column
                    headerClassName='cursor-move'
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    pt={{
                        root: {
                            style: {
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            },
                        },
                    }}
                />
            ))}
        </DataTable>
    );
};
