import React, { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { getKeyValue } from "services/local-storage.service";
import { getReportById, getReportsList, makeReports } from "http/services/reports.service";
import { Button } from "primereact/button";

export default function Reports() {
    const [reports, setReports] = useState<any[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    const printTableData = () => {
        makeReports(authUser?.useruid).then((response) => {
            getReportById(response.taskuid).then((response) => {
                // eslint-disable-next-line no-console
                console.log(response);
            });
        });
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue("admss-client-app-user");
        if (authUser) {
            setUser(authUser);
            getReportsList(authUser.useruid, { total: 1 }).then((response) => {});
        }
    }, []);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Reports</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-6'>
                                <div className='contact-top-controls'>
                                    <Button
                                        severity='success'
                                        label='Print report'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={printTableData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
