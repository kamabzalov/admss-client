import React, { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DataTable, DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { getKeyValue } from "services/local-storage.service";
import { getAccountsList } from "http/services/accounts.service";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { QueryParams } from "common/models/query-params";
import { LS_APP_USER } from "common/constants/localStorage";
import { ROWS_PER_PAGE } from "common/settings";

export default function Accounts() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

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
            getAccountsList(authUser.useruid, { total: 1 }).then((response) => {
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
            getAccountsList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setAccounts(response);
                } else {
                    setAccounts([]);
                }
            });
        }
    }, [lazyState, authUser, globalSearch]);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Accounts</h2>
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
                                    value={accounts}
                                    lazy
                                    paginator
                                    first={lazyState.first}
                                    rows={lazyState.rows}
                                    rowsPerPageOptions={ROWS_PER_PAGE}
                                    totalRecords={totalRecords}
                                    onPage={pageChanged}
                                    onSort={sortData}
                                    sortOrder={lazyState.sortOrder}
                                    sortField={lazyState.sortField}
                                >
                                    <Column field='accountnumber' header='Account'></Column>
                                    <Column field='accounttype' header='Type'></Column>
                                    <Column field='accountstatus' header='Name'></Column>
                                    <Column field='created' header='Date'></Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
