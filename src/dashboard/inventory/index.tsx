import { ReactElement, useEffect, useState } from "react";
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
import { getInventoryList } from "http/services/inventory-service";
import { Inventory } from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { Column } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { LS_APP_USER } from "common/constants/localStorage";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { ROWS_PER_PAGE } from "common/settings";
import { DashboardDialog } from "dashboard/common/dialog";

const isObjectEmpty = (obj: Record<string, string>) =>
    Object.values(obj).every((value) => !value.trim().length);

const createStringifySearchQuery = (obj: Record<string, string>): string => {
    let searchQueryString = "";
    if (Object.values(obj).every((value) => !value)) {
        return searchQueryString;
    }
    Object.entries(obj).forEach(([key, value], index) => {
        if (value.length > 0) {
            searchQueryString += `${index > 0 ? "+" : ""}${value}.${key}`;
        }
    });
    return searchQueryString;
};

interface AdvancedSearch extends Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN"> {}

export default function Inventories(): ReactElement {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearch>({});
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

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

    const handleGetInventoryList = async (params: QueryParams, total?: boolean) => {
        if (authUser) {
            if (total) {
                getInventoryList(authUser.useruid, { ...params, total: 1 }).then((response) => {
                    response && !Array.isArray(response) && setTotalRecords(response.total ?? 0);
                });
            }
            getInventoryList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setInventories(response);
                } else {
                    setInventories([]);
                }
            });
        }
    };

    useEffect(() => {
        const isAdvancedSearchEmpty = isObjectEmpty(advancedSearch);

        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(!isAdvancedSearchEmpty && { qry: createStringifySearchQuery(advancedSearch) }),
            ...(globalSearch && { qry: globalSearch }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip: lazyState.first,
            top: lazyState.rows,
        };
        handleGetInventoryList(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyState, authUser, globalSearch]);

    const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string) => {
        setAdvancedSearch((prevSearch) => {
            const newSearch = { ...prevSearch, [key]: value };

            const isAnyValueEmpty = isObjectEmpty(newSearch);

            setButtonDisabled(isAnyValueEmpty);

            return newSearch;
        });
    };

    const handleAdvancedSearch = () => {
        const params = createStringifySearchQuery(advancedSearch);
        handleGetInventoryList({ ...lazyState, qry: params }, true);

        setDialogVisible(false);
    };

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
                                    onClick={() => setDialogVisible(true)}
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
                                    rowsPerPageOptions={ROWS_PER_PAGE}
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
                                    <Column field='Make' header='Make' sortable></Column>
                                    <Column field='Model' header='Model' sortable></Column>
                                    <Column field='Year' header='Year' sortable></Column>
                                    <Column field='Color' header='Color' sortable></Column>
                                    <Column field='mileage' header='Miles' sortable></Column>
                                    <Column field='Price' header='Price' sortable></Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
                <DashboardDialog
                    className='search-dialog'
                    footer='Search'
                    header='Advanced search'
                    visible={dialogVisible}
                    buttonDisabled={buttonDisabled}
                    action={handleAdvancedSearch}
                    onHide={() => {
                        setButtonDisabled(true);
                        setDialogVisible(false);
                    }}
                >
                    <div className='flex flex-column gap-4 pt-4'>
                        <span className='p-float-label'>
                            <InputText
                                className='w-full'
                                value={advancedSearch?.StockNo}
                                onChange={({ target }) =>
                                    handleSetAdvancedSearch("StockNo", target.value)
                                }
                            />
                            <label className='float-label'>Stock#</label>
                        </span>
                        <span className='p-float-label'>
                            <InputText
                                className='w-full'
                                value={advancedSearch?.Make}
                                onChange={({ target }) =>
                                    handleSetAdvancedSearch("Make", target.value)
                                }
                            />
                            <label className='float-label'>Make</label>
                        </span>
                        <span className='p-float-label'>
                            <InputText
                                className='w-full'
                                value={advancedSearch?.Model}
                                onChange={({ target }) =>
                                    handleSetAdvancedSearch("Model", target.value)
                                }
                            />
                            <label className='float-label'>Model</label>
                        </span>
                        <span className='p-float-label'>
                            <InputText
                                className='w-full'
                                value={advancedSearch?.VIN}
                                onChange={({ target }) =>
                                    handleSetAdvancedSearch("VIN", target.value)
                                }
                            />
                            <label className='float-label'>VIN</label>
                        </span>
                    </div>
                </DashboardDialog>
            </div>
        </div>
    );
}
