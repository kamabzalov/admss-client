import { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { getKeyValue } from "services/local-storage.service";
import { getInventoryList, Inventory } from "http/services/inventory-service";
import { QueryParams } from "common/models/query-params";
import { Column } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { LS_APP_USER } from "common/constants/localStorage";
import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Inventories() {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    const navigate = useNavigate();

    const printTableData = () => {
        const contactsDoc = new jsPDF();
        autoTable(contactsDoc, { html: ".p-datatable-table" });
        contactsDoc.output("dataurlnewwindow");
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setUser(authUser);
            getInventoryList(authUser.useruid, { total: 1 }).then((response) => {
                response && !Array.isArray(response) && setTotalRecords(response.total ?? 0);
            });
        }
    }, []);

    useEffect(() => {
        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(globalSearch && { qry: globalSearch }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip: lazyState.first,
            top: lazyState.rows,
        };
        if (authUser) {
            getInventoryList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setInventories(response);
                } else {
                    setInventories([]);
                }
            });
        }
    }, [lazyState, authUser, globalSearch]);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Inventory</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid datatable-controls'>
                            <div className='col-6'>
                                <div className='contact-top-controls'>
                                    <Button
                                        className='contact-top-controls__button m-r-20px'
                                        icon='pi pi-plus-circle'
                                        severity='success'
                                        type='button'
                                        onClick={() => navigate("create")}
                                    />
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={printTableData}
                                    />
                                </div>
                            </div>
                            <div className='col-6 text-right'>
                                <Button
                                    className='contact-top-controls__button m-r-20px'
                                    label='Advanced search'
                                    severity='success'
                                    type='button'
                                />
                                <span className='p-input-icon-right'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        value={globalSearch}
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className='grid'>
                            <div className='col-12'>
                                <DataTable
                                    value={inventories}
                                    lazy
                                    paginator
                                    first={lazyState.first}
                                    rows={lazyState.rows}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    totalRecords={totalRecords}
                                    onPage={pageChanged}
                                    onSort={sortData}
                                    sortOrder={lazyState.sortOrder}
                                    sortField={lazyState.sortField}
                                    rowClassName={() => "hover:text-primary cursor-pointer"}
                                    onRowClick={({ data: { itemuid } }: DataTableRowClickEvent) =>
                                        navigate(itemuid)
                                    }
                                >
                                    <Column field='StockNo' header='StockNo' sortable></Column>
                                    <Column field='Make' header='Make'></Column>
                                    <Column field='Model' header='Model'></Column>
                                    <Column field='Year' header='Year'></Column>
                                    <Column field='Color' header='Color'></Column>
                                    <Column field='mileage' header='Miles'></Column>
                                    <Column field='Price' header='Price'></Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
