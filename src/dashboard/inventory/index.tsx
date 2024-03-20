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
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";

interface AdvancedSearch extends Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN"> {}

type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

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
        .map(([key, value], index) => {
            return `${index > 0 ? "+" : ""}${value}.${key}`;
        })
        .join("");
};

interface FilterOptions {
    label: string;
    value: string;
    column?: keyof Inventory | "Misc";
    bold?: boolean;
    disabled?: boolean;
}

const filterOptions: FilterOptions[] = [
    { label: "Status", value: "status", bold: true, disabled: true },
    { label: "All", value: "all", column: "Status" },
    { label: "Current (not sold)", column: "Status", value: "current" },
    { label: "Sold", column: "Status", value: "sold" },
    { label: "Age", value: "age", bold: true, disabled: true },
    { label: "0 to 30 days", column: "Age", value: "0-30" },
    { label: "31 to 60 days", column: "Age", value: "31-60" },
    { label: "61 to 90 days", column: "Age", value: "61-90" },
    { label: "90+ days", column: "Age", value: "over90" },
    { label: "Body", value: "body", bold: true, disabled: true },
    { label: "Trucks", column: "BodyStyle", value: "trucks" },
    { label: "SUVs", column: "BodyStyle", value: "suv" },
    { label: "Sedans", column: "BodyStyle", value: "sedans" },
    { label: "Coupes", column: "BodyStyle", value: "coupes" },
    { label: "Convertibles", column: "BodyStyle", value: "convertibles" },
    { label: "Miles", value: "miles", bold: true, disabled: true },
    { label: "0 to 30000", column: "mileage", value: "0-30000" },
    { label: "30000 to 100000", column: "mileage", value: "30000-100000" },
    { label: "over 100000", column: "mileage", value: "over100000" },
    { label: "Audit", value: "audit", bold: true, disabled: true },
    { label: "Data needs update", column: "Audit", value: "needsUpdatedata" },
    { label: "Just arrived (today)", column: "Audit", value: "arrivedToday" },
    { label: "Needs cleaning", column: "Audit", value: "needsCleaning" },
    { label: "Ready for sale", column: "Audit", value: "readySale" },
    { label: "Needs inspection", column: "Audit", value: "needsInspection" },
    { label: "Needs oil changes", column: "Audit", value: "needsOil" },
    { label: "Floorplanned", column: "Audit", value: "floorplanned" },
    { label: "Keys missing", column: "Audit", value: "keysMissing" },
    { label: "Title missing", column: "Audit", value: "titleMissing" },
    { label: "Not paid", column: "Audit", value: "notPaid" },
    // TODO: missed misc column
    { label: "Misc", column: "Misc", value: "misc", bold: true, disabled: true },
    { label: "AWD", column: "Misc", value: "awd" },
    { label: "Manual Transmission", column: "Misc", value: "manual" },
    { label: "Diesel", column: "Misc", value: "diesel" },
    { label: "Fuel economy", column: "Misc", value: "fuelEconomy" },
    { label: "Electric", column: "Misc", value: "electric" },
];

interface TableColumnProps extends ColumnProps {
    field: keyof Inventory | MissedInventoryColumn;
}

type MissedInventoryColumn =
    | "Location"
    | "IsFloorplanned"
    | "FloorplanCompany"
    | "PurchasedFrom"
    | "PurchaseAuctCo"
    | "PurchaseBuyerName"
    | "PurchaseDate"
    | "PurchaseAmount"
    | "LotNo"
    | "SoldByLot"
    | "KeysMissing"
    | "KeysDuplicate"
    | "KeysHasRemote"
    | "KeyNumber"
    | "Consignor"
    | "Consign"
    | "IsTradeIn"
    | "TitleStatus"
    | "TitleState"
    | "TitleNumber"
    | "TitleReceived"
    | "TitleReceivedDate"
    | "Paid"
    | "SalesTaxPaid"
    | "ODOMInExcess"
    | "ODOMNotActual"
    | "DAM_Salvage"
    | "DAM_Salvage_State"
    | "DAM_Flood"
    | "DAM_25"
    | "DAM_25_Parts"
    | "DAM_Theft"
    | "DAM_Theft_Parts"
    | "DAM_Reconstructed"
    | "Autocheck_Checked"
    | "CHK_Oil"
    | "CHK_Inspected"
    | "INSP_Number"
    | "INSP_Date"
    | "INSP_Emissions"
    | "INSP_Sticker_Exp"
    | "In Stock Date"
    | "City MPG"
    | "Hwy MPG";

const columns: TableColumnsList[] = [
    { field: "VIN", header: "VIN", checked: true },
    { field: "StockNo", header: "Stock#", checked: true },
    { field: "Category", header: "Category", checked: false },
    { field: "Year", header: "Year", checked: true },
    { field: "Make", header: "Make", checked: true },
    { field: "Model", header: "Model", checked: true },
    { field: "mileage", header: "Mileage", checked: true },
    { field: "Price", header: "Price", checked: true },
    { field: "ExteriorColor", header: "Color", checked: false },
    { field: "InteriorColor", header: "Interior Color", checked: false },
    { field: "BodyStyle", header: "Body", checked: false },
    { field: "Transmission", header: "Transmission", checked: false },
    { field: "TypeOfFuel", header: "Fuel Type", checked: false },
    { field: "DriveLine", header: "Drive Line", checked: false },
    { field: "Cylinders", header: "Number of Cylinders", checked: false },
    { field: "Engine", header: "Engine Descriptions", checked: false },
    { field: "Status", header: "Status", checked: false },
    { field: "GroupClass", header: "Group Class", checked: false },
    { field: "Location", header: "Location", checked: false },
    { field: "IsFloorplanned", header: "Floorplan Status", checked: false },
    { field: "FloorplanCompany", header: "Floorplan Company", checked: false },
    { field: "PurchasedFrom", header: "Purchased From", checked: false },
    { field: "PurchaseAuctCo", header: "Purchase Auction Company", checked: false },
    { field: "PurchaseBuyerName", header: "Purchase Buyer Name", checked: false },
    { field: "PurchaseDate", header: "Purchase Date", checked: false },
    { field: "PurchaseAmount", header: "Purchase Amount", checked: false },
    { field: "LotNo", header: "Lot Number", checked: false },
    { field: "SoldByLot", header: "Sold By Lot", checked: false },
    { field: "KeysMissing", header: "Keys Missing", checked: false },
    { field: "KeysDuplicate", header: "Duplicate Keys", checked: false },
    { field: "KeysHasRemote", header: "Keys with Remote", checked: false },
    { field: "KeyNumber", header: "Key Number", checked: false },
    { field: "Consignor", header: "Consignor", checked: false },
    { field: "Consign", header: "Consign Date", checked: false },
    { field: "IsTradeIn", header: "Trade-In Status", checked: false },
    { field: "TitleStatus", header: "Title Status", checked: false },
    { field: "TitleState", header: "Title State", checked: false },
    { field: "TitleNumber", header: "Title Number", checked: false },
    { field: "TitleReceived", header: "Title Received", checked: false },
    { field: "TitleReceivedDate", header: "Title Received Date", checked: false },
    { field: "Paid", header: "Paid", checked: false },
    { field: "SalesTaxPaid", header: "Sales Tax Paid", checked: false },
    { field: "ODOMInExcess", header: "Odometer in Excess", checked: false },
    { field: "ODOMNotActual", header: "Odometer Not Actual", checked: false },
    { field: "DAM_Salvage", header: "Salvage Status", checked: false },
    { field: "DAM_Salvage_State", header: "Salvage State", checked: false },
    { field: "DAM_Flood", header: "Flood Status", checked: false },
    { field: "DAM_25", header: "Damage Percentage", checked: false },
    { field: "DAM_25_Parts", header: "Damaged Parts", checked: false },
    { field: "DAM_Theft", header: "Theft Status", checked: false },
    { field: "DAM_Theft_Parts", header: "Theft Parts", checked: false },
    { field: "DAM_Reconstructed", header: "Reconstruction Status", checked: false },
    { field: "Autocheck_Checked", header: "Autocheck Status", checked: false },
    { field: "CHK_Oil", header: "Oil Check", checked: false },
    { field: "CHK_Inspected", header: "State Inspection", checked: false },
    { field: "FactoryCertified", header: "Factory Certified", checked: false },
    { field: "DealerCertified", header: "Dealer Certified", checked: false },
    { field: "INSP_Number", header: "Inspection Number", checked: false },
    { field: "INSP_Date", header: "Inspection Date", checked: false },
    { field: "INSP_Emissions", header: "Emissions Check", checked: false },
    { field: "INSP_Sticker_Exp", header: "Sticker Expiration Date", checked: false },
    { field: "In Stock Date", header: "In Stock Date", checked: false },
    { field: "City MPG", header: "City MPG", checked: false },
    { field: "Hwy MPG", header: "Highway MPG", checked: false },
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
    const [selectedFilter, setSelectedFilter] = useState<FilterOptions[]>([]);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<FilterOptions[] | null>(
        null
    );

    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>(
        columns.filter((column) => column.checked)
    );

    const navigate = useNavigate();

    const printTableData = () => {
        const contactsDoc = new jsPDF();
        autoTable(contactsDoc, { html: ".p-datatable-table" });
        contactsDoc.output("dataurlnewwindow");
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
        authUser && setUserSettings(authUser?.useruid, { page: event });
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
        authUser && setUserSettings(authUser?.useruid, { sort: event });
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setUser(authUser);
            getInventoryList(authUser.useruid, { total: 1 }).then((response) => {
                response && !Array.isArray(response) && setTotalRecords(response.total ?? 0);
            });
            getUserSettings(authUser.useruid).then((response) => {
                if (response) {
                }
            });
        }
    }, []);

    const onColumnToggle = ({ value, selectedOption }: MultiSelectChangeEvent) => {
        const column: TableColumnsList = selectedOption;
        column.checked = !column.checked;
        setActiveColumns(value.filter((item: TableColumnsList) => item.checked));
        authUser && setUserSettings(authUser.useruid, { activeColumns });
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

    const handleSetAdvancedSearch = (key: keyof Inventory, value: string) => {
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

    useEffect(() => {
        if (selectedFilterOptions) {
            let qry: string = "";
            selectedFilterOptions.forEach((option, index) => {
                const { column, value } = option;
                if (value.includes("-")) {
                    const [wordFrom, wordTo] = value.split("-");
                    return (qry += `${index > 0 ? "+" : ""}${wordFrom}.${wordTo}.${column}`);
                }
                qry += `${index > 0 ? "+" : ""}${value}.${column}`;
            });
            const params: QueryParams = {
                ...(lazyState.sortOrder === 1 && { type: "asc" }),
                ...(lazyState.sortOrder === -1 && { type: "desc" }),
                ...{
                    qry,
                },
                skip: lazyState.first,
                top: lazyState.rows,
            };
            handleGetInventoryList(params);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFilterOptions]);

    const header = (
        <div className='grid datatable-controls'>
            <div className='col-2'>
                <MultiSelect
                    optionValue='value'
                    optionLabel='label'
                    options={filterOptions}
                    value={selectedFilter}
                    onChange={({ value }: MultiSelectChangeEvent) => {
                        const selectedOptions = filterOptions.filter((option) =>
                            value.includes(option.value)
                        );
                        setSelectedFilterOptions(selectedOptions);
                        setSelectedFilter(value);
                        authUser &&
                            setUserSettings(authUser.useruid, {
                                selectedFilterOptions: selectedOptions,
                            });
                    }}
                    placeholder='Filter'
                    className='w-full pb-0 h-full flex align-items-center inventory-filter'
                    display='chip'
                    selectedItemsLabel='Clear Filter'
                    pt={{
                        header: {
                            className: "inventory-filter__header",
                        },
                        wrapper: {
                            className: "inventory-filter__wrapper",
                            style: {
                                maxHeight: "500px",
                            },
                        },
                    }}
                />
            </div>
            <div className='col-2'>
                <MultiSelect
                    options={columns}
                    value={activeColumns}
                    optionLabel='header'
                    onChange={onColumnToggle}
                    showSelectAll={false}
                    className='w-full pb-0 h-full flex align-items-center column-picker'
                    display='chip'
                    pt={{
                        header: {
                            className: "column-picker__header",
                        },
                    }}
                />
            </div>
            <div className='col-2'>
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
                                    scrollable
                                    scrollHeight='70vh'
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
                                    onColReorder={(event) => {
                                        if (authUser && Array.isArray(event.columns)) {
                                            const orderArray = event.columns?.map(
                                                (column: any) => column.props.field
                                            );
                                            setUserSettings(authUser.useruid, {
                                                columnOrder: orderArray,
                                            });
                                        }
                                    }}
                                    onColumnResizeEnd={(event) => {
                                        if (authUser && event) {
                                            const columnWidth = {
                                                [event.column.props.field as string]:
                                                    event.element.offsetWidth,
                                            };
                                            setUserSettings(authUser.useruid, {
                                                columnWidth,
                                            });
                                        }
                                    }}
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
