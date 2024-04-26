import { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { getKeyValue } from "services/local-storage.service";
import { QueryParams } from "common/models/query-params";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnProps } from "primereact/column";
import { getDealsList } from "http/services/deals.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { ROWS_PER_PAGE } from "common/settings";
import { Inventory } from "common/models/inventory";
import { makeShortReports } from "http/services/reports.service";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { ReportsColumn } from "common/models/reports";
import { Loader } from "dashboard/common/loader";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "accountuid", header: "Account" },
    { field: "contactinfo", header: "Customer" },
    { field: "dealtype", header: "Type" },
    { field: "created", header: "Date" },
    { field: "inventoryinfo", header: "Info (Vehicle)" },
];

export default function Deals() {
    const [deals, setDeals] = useState<Inventory[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const printTableData = async (print: boolean = false) => {
        setIsLoading(true);
        const columns: ReportsColumn[] = renderColumnsData.map((column) => ({
            name: column.header as string,
            data: column.field as string,
        }));
        const date = new Date();
        const name = `deals_${
            date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

        if (authUser) {
            const data = deals.map((item) => {
                const filteredItem: Record<string, any> = {};
                columns.forEach((column) => {
                    if (item.hasOwnProperty(column.data)) {
                        filteredItem[column.data] = item[column.data as keyof typeof item];
                    }
                });
                return filteredItem;
            });
            const JSONreport = {
                name,
                itemUID: "0",
                data,
                columns,
                format: "",
            };
            await makeShortReports(authUser.useruid, JSONreport).then((response) => {
                const url = new Blob([response], { type: "application/pdf" });
                let link = document.createElement("a");
                link.href = window.URL.createObjectURL(url);
                if (!print) {
                    link.download = `Report-${name}.pdf`;
                    link.click();
                }

                if (print) {
                    window.open(
                        link.href,
                        "_blank",
                        "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                    );
                }
            });
        }
        setIsLoading(false);
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
            getDealsList(authUser.useruid, { total: 1 }).then((response) => {
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
            getDealsList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setDeals(response);
                } else {
                    setDeals([]);
                }
            });
        }
    }, [lazyState, authUser, globalSearch]);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Deals</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid datatable-controls'>
                            <div className='col-6'>
                                <div className='contact-top-controls'>
                                    <Button
                                        className='contact-top-controls__button'
                                        icon='pi pi-plus-circle'
                                        severity='success'
                                        type='button'
                                        tooltip='Add new deal'
                                        onClick={() => navigate("create")}
                                    />
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='icon adms-print'
                                        tooltip='Print deals form'
                                        onClick={() => printTableData(true)}
                                    />
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='icon adms-blank'
                                        tooltip='Download deals form'
                                        onClick={() => printTableData()}
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
                                {!deals.length || isLoading ? (
                                    <div className='dashboard-loader__wrapper'>
                                        <Loader overlay />
                                    </div>
                                ) : (
                                    <DataTable
                                        showGridlines
                                        value={deals}
                                        lazy
                                        paginator
                                        first={lazyState.first}
                                        rows={lazyState.rows}
                                        rowsPerPageOptions={ROWS_PER_PAGE}
                                        totalRecords={totalRecords}
                                        onPage={pageChanged}
                                        onSort={sortData}
                                        reorderableColumns
                                        resizableColumns
                                        sortOrder={lazyState.sortOrder}
                                        sortField={lazyState.sortField}
                                        rowClassName={() => "hover:text-primary cursor-pointer"}
                                        onRowClick={({
                                            data: { contactuid },
                                        }: DataTableRowClickEvent) => {
                                            navigate(contactuid);
                                        }}
                                    >
                                        {renderColumnsData.map(({ field, header }) => (
                                            <Column
                                                field={field}
                                                header={header}
                                                key={field}
                                                sortable
                                                headerClassName='cursor-move'
                                            />
                                        ))}
                                    </DataTable>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
