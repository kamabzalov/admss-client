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
import { TotalDealsList, getDealsList } from "http/services/deals.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { ROWS_PER_PAGE } from "common/settings";
import { makeShortReports } from "http/services/reports.service";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { ReportsColumn } from "common/models/reports";
import { Deal } from "common/models/deals";
import { Loader } from "dashboard/common/loader";
import { MultiSelect } from "primereact/multiselect";
import { BaseResponseError } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "accountuid", header: "Account" },
    { field: "contactinfo", header: "Customer" },
    { field: "dealtype", header: "Type" },
    { field: "created", header: "Date" },
    { field: "inventoryinfo", header: "Info (Vehicle)" },
];

interface DealsFilterOptions {
    name: string;
    value: string;
}

interface DealsFilterGroup {
    name: string;
    options: DealsFilterOptions[];
}

const DEALS_TYPE_LIST: DealsFilterOptions[] = [
    { name: "All", value: "allTypes" },
    { name: "Buy Here Pay Here", value: "0.DealType" },
    { name: "Lease Here Pay Here", value: "7.DealType" },
    { name: "Cash", value: "1.DealType" },
    { name: "Wholesale", value: "5.DealType" },
    { name: "Dismantled", value: "6.DealType" },
];

const DEALS_OTHER_LIST: DealsFilterOptions[] = [
    { name: "All incomplete", value: "0.DealComplete" },
    { name: "Dead or Deleted", value: "6.DealStatus" },
    { name: "Manager's review", value: "1.managerReview" },
    { name: "Deals not yet sent to RFC", value: "0.RFCSent" },
];

const DEALS_STATUS_LIST: DealsFilterOptions[] = [
    { name: "All", value: "allStatuses" },
    { name: "Recent deals", value: "0.30.Age" },
    { name: "Quotes", value: "0.DealStatus" },
    { name: "Pending", value: "1.DealStatus" },
    { name: "Sold, Not finalized", value: "2.DealStatus" },
];

const FILTER_GROUP_LIST: DealsFilterGroup[] = [
    { name: "Type (one of the list)", options: DEALS_TYPE_LIST },
    { name: "Status (one of the list)", options: DEALS_STATUS_LIST },
    { name: "Other", options: DEALS_OTHER_LIST },
];

export default function Deals() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dealSelectedGroup, setDealSelectedGroup] = useState<string[]>([]);

    const navigate = useNavigate();
    const toast = useToast();

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
                const { error } = response as BaseResponseError;
                if (response && !error) {
                    const { total } = response as TotalDealsList;
                    setTotalRecords(total ?? 0);
                } else {
                    toast.current?.show({
                        severity: "error",
                        summary: "Error",
                        detail: error,
                    });
                }
            });
        }
    }, [toast]);

    useEffect(() => {
        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(globalSearch && { qry: globalSearch }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip: lazyState.first,
            top: lazyState.rows,
        };
        let qry: string = "";
        const selectedFilters: string = [...dealSelectedGroup]
            .filter((item) => item && item !== "allTypes" && item !== "allStatuses")
            .join("+");
        if (selectedFilters.length) {
            qry += selectedFilters;
            params.qry = qry;
        }
        if (authUser) {
            getDealsList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setDeals(response);
                } else {
                    setDeals([]);
                }
            });
        }
    }, [lazyState, authUser, globalSearch, dealSelectedGroup]);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card deals'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Deals</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid datatable-controls'>
                            <div className='col-2'>
                                <span className='p-float-label'>
                                    <MultiSelect
                                        optionValue='value'
                                        optionLabel='name'
                                        value={dealSelectedGroup}
                                        options={FILTER_GROUP_LIST}
                                        optionGroupLabel='name'
                                        optionGroupChildren='options'
                                        panelHeaderTemplate={<></>}
                                        display='chip'
                                        className='deals__dropdown'
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            setDealSelectedGroup(e.value);
                                        }}
                                        pt={{
                                            wrapper: {
                                                style: {
                                                    maxHeight: "625px",
                                                },
                                            },
                                        }}
                                    />
                                    <label className='float-label'>Filter</label>
                                </span>
                            </div>

                            <div className='col-4'>
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
                            <div className='col-6 text-right flex flex-nowrap'>
                                <Button
                                    className='contact-top-controls__button m-r-20px ml-auto'
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
                                {isLoading ? (
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
                                            data: { dealuid },
                                        }: DataTableRowClickEvent) => {
                                            navigate(dealuid);
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
