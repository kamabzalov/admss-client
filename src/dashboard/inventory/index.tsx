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
import { Column, ColumnProps } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { LS_APP_USER } from "common/constants/localStorage";
import { useNavigate } from "react-router-dom";
import "./index.css";

import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { ROWS_PER_PAGE } from "common/settings";
import { AdvancedSearchDialog, SearchField } from "dashboard/common/dialog/search";

interface AdvancedSearch extends Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN"> {}

interface TableColumnProps extends ColumnProps {
    field: keyof Inventory;
}

type TableColumnsList = Pick<TableColumnProps, "header" | "field">;

const isObjectEmpty = (obj: Record<string, string>) =>
    Object.values(obj).every((value) => !value.trim().length);

const filterParams = (obj: Record<string, string>): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(obj).filter(
            ([_, value]) => typeof value === "string" && value.trim().length > 0
        )
    );
};

const createStringifySearchQuery = (obj: Record<string, string>): string => {
    const filteredObj = filterParams(obj);

    if (Object.keys(filteredObj).length === 0) {
        return "";
    }

    return Object.entries(filteredObj)
        .map(([key, value], index) => `${index > 0 ? "+" : ""}${value}.${key}`)
        .join("");
};

const columns: TableColumnsList[] = [
    { field: "Model", header: "Model" },
    { field: "ExteriorColor", header: "Color" },
    { field: "mileage", header: "Miles" },
    { field: "Price", header: "Price" },
    { field: "Status", header: "Status" },
    { field: "VIN", header: "VIN" },
    { field: "BodyStyle", header: "Body" },
];

export default function Inventories(): ReactElement {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearch>({});
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>(columns);

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

    const onColumnToggle = (event: MultiSelectChangeEvent) => {
        let selectedColumns = event.value;
        let orderedSelectedColumns = columns.filter((col) =>
            selectedColumns.some(
                (sCol: Pick<TableColumnProps, "field">) => sCol.field === col.field
            )
        );

        setActiveColumns(orderedSelectedColumns);
    };

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
        const searchParams = createStringifySearchQuery(advancedSearch);
        handleGetInventoryList({ ...filterParams(lazyState), qry: searchParams }, true);

        setDialogVisible(false);
    };

    const handleClearAdvancedSearchField = async (key: keyof AdvancedSearch) => {
        setButtonDisabled(true);
        setAdvancedSearch((prev) => {
            const updatedSearch = { ...prev };
            delete updatedSearch[key];
            return updatedSearch;
        });

        try {
            const updatedSearch = { ...advancedSearch };
            delete updatedSearch[key];

            const isAdvancedSearchEmpty = isObjectEmpty(advancedSearch);
            const params: QueryParams = {
                ...(lazyState.sortOrder === 1 && { type: "asc" }),
                ...(lazyState.sortOrder === -1 && { type: "desc" }),
                ...(!isAdvancedSearchEmpty && { qry: createStringifySearchQuery(updatedSearch) }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            await handleGetInventoryList(params);
        } finally {
            setButtonDisabled(false);
        }
    };

    const searchFields: SearchField<AdvancedSearch>[] = [
        {
            key: "StockNo",
            value: advancedSearch?.StockNo,
        },
        {
            key: "Make",
            value: advancedSearch?.Make,
        },
        {
            key: "Model",
            value: advancedSearch?.Model,
        },
        {
            key: "VIN",
            value: advancedSearch?.VIN,
        },
    ];

    const header = (
        <div className='grid datatable-controls'>
            <div className='col-3'>
                <MultiSelect
                    value={activeColumns}
                    options={columns}
                    optionLabel='header'
                    onChange={onColumnToggle}
                    className='w-full pb-0 h-full flex align-items-center'
                    display='chip'
                />
            </div>
            <div className='col-3'>
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
                    <i
                        className={`pi pi-${!globalSearch ? "search" : "times cursor-pointer"}`}
                        onClick={() => setGlobalSearch("")}
                    />
                    <InputText
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                    />
                </span>
            </div>
        </div>
    );

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Inventory</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12'>
                                <DataTable
                                    showGridlines
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
                                    reorderableColumns
                                    resizableColumns
                                    header={header}
                                    rowClassName={() => "hover:text-primary cursor-pointer"}
                                    onRowClick={({ data: { itemuid } }: DataTableRowClickEvent) =>
                                        navigate(itemuid)
                                    }
                                >
                                    {activeColumns.map(({ field, header }) => (
                                        <Column
                                            field={field}
                                            header={header}
                                            key={field}
                                            sortable
                                            headerClassName='cursor-move'
                                        />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
                <AdvancedSearchDialog<AdvancedSearch>
                    visible={dialogVisible}
                    buttonDisabled={buttonDisabled}
                    onHide={() => {
                        setButtonDisabled(true);
                        setDialogVisible(false);
                    }}
                    action={handleAdvancedSearch}
                    onSearchClear={handleClearAdvancedSearchField}
                    onInputChange={handleSetAdvancedSearch}
                    fields={searchFields}
                />
            </div>
        </div>
    );
}
