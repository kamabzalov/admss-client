import { useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { DataTable, DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { getKeyValue } from "services/local-storage.service";
import { QueryParams } from "common/models/query-params";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnEditorOptions, ColumnProps } from "primereact/column";
import { LS_APP_USER } from "common/constants/localStorage";
import { ROWS_PER_PAGE } from "common/settings";
import { getExportToWebList } from "http/services/export-to-web.service";
import { ExportWebList } from "common/models/export-web";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { setInventory } from "http/services/inventory-service";
import { Inventory } from "common/models/inventory";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ExportWebUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { getReportById, makeReports } from "http/services/reports.service";

interface TableColumnProps extends ColumnProps {
    field: keyof Inventory | MissedInventoryColumn;
}

type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

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

export const ExportToWeb = () => {
    const [exportsToWeb, setExportsToWeb] = useState<ExportWebList[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>(
        columns.filter((column) => column.checked)
    );
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();

    const navigate = useNavigate();

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setUser(authUser);
            getExportToWebList(authUser.useruid, { total: 1 }).then((response) => {
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
            getExportToWebList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setExportsToWeb(response);
                } else {
                    setExportsToWeb([]);
                }
            });
        }
    }, [lazyState, authUser, globalSearch]);

    const changeSettings = (settings: Partial<ExportWebUserSettings>) => {
        if (authUser) {
            const newSettings = {
                ...serverSettings,
                exportWeb: { ...serverSettings?.exportWeb, ...settings },
            } as ServerUserSettings;
            setServerSettings(newSettings);
            setUserSettings(authUser.useruid, newSettings);
        }
    };

    useEffect(() => {
        if (authUser) {
            getUserSettings(authUser.useruid).then((response) => {
                if (response?.profile.length) {
                    const allSettings: ServerUserSettings = JSON.parse(response.profile);
                    setServerSettings(allSettings);
                    const { exportWeb: settings } = allSettings;
                    settings?.activeColumns && setActiveColumns(settings.activeColumns);
                    settings?.table &&
                        setLazyState({
                            first: settings.table.first || initialDataTableQueries.first,
                            rows: settings.table.rows || initialDataTableQueries.rows,
                            page: settings.table.page || initialDataTableQueries.page,
                            column: settings.table.column || initialDataTableQueries.column,
                            sortField:
                                settings.table.sortField || initialDataTableQueries.sortField,
                            sortOrder:
                                settings.table.sortOrder || initialDataTableQueries.sortOrder,
                        });
                }
            });
        }
    }, [authUser]);

    const printTableData = async (print: boolean = false) => {
        const columns: string[] = activeColumns.map((column) => column.field);
        const date = new Date();
        const name = `export-web_${date.getMonth()}-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;
        let qry: string = "";

        if (globalSearch) {
            qry += globalSearch;
        }

        const params: QueryParams = {};

        if (qry) {
            params.qry = qry;
        }

        if (authUser) {
            const data = await getExportToWebList(authUser.useruid, params);
            const JSONreport = {
                name,
                type: "table",
                data,
                columns,
                format: "",
            };
            await makeReports(authUser.useruid, JSONreport).then((response) => {
                setTimeout(() => {
                    getReportById(response.taskuid).then((response) => {
                        const url = new Blob([response], { type: "application/pdf" });
                        let link = document.createElement("a");
                        link.href = window.URL.createObjectURL(url);
                        link.download = "Report.pdf";
                        link.click();

                        if (print) {
                            window.open(
                                link.href,
                                "_blank",
                                "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                            );
                        }
                    });
                }, 5000);
            });
        }
    };

    const onColumnToggle = ({ value, selectedOption }: MultiSelectChangeEvent) => {
        const column: TableColumnsList = selectedOption;
        column.checked = !column.checked;
        const newColumns = value.filter((item: TableColumnsList) => item.checked);
        setActiveColumns(newColumns);
        changeSettings({ activeColumns: newColumns });
    };

    const handleEditedValueSet = (
        key: "Enter" | unknown,
        field: keyof ExportWebList,
        value: string,
        id: string
    ) => {
        if (key === "Enter") {
            if (field === "Price") {
                setInventory(id, { Price: Number(value) });
            }
            setInventory(id, { [field]: value });
        }
    };

    const cellEditor = (options: ColumnEditorOptions) => {
        return (
            <InputText
                type='text'
                className='h-full m-0 py-0 px-2 w-full'
                value={options.value}
                onChange={(evt) => options.editorCallback!(evt.target.value)}
                onKeyDown={(evt) =>
                    handleEditedValueSet(
                        evt.key,
                        options.field as keyof ExportWebList,
                        options.value,
                        options.rowData.itemuid
                    )
                }
            />
        );
    };

    const allowedEditableFields: Partial<keyof ExportWebList>[] = [
        "ExteriorColor",
        "mileage",
        "Price",
    ];

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Export to web</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid datatable-controls'>
                            <div className='col-2'>
                                <MultiSelect
                                    options={columns}
                                    value={activeColumns.filter((column) => column.checked)}
                                    optionLabel='header'
                                    onChange={onColumnToggle}
                                    showSelectAll={false}
                                    className='w-full pb-0 h-full flex align-items-center column-picker'
                                    display='chip'
                                    pt={{
                                        header: {
                                            className: "column-picker__header",
                                        },
                                        wrapper: {
                                            className: "column-picker__wrapper",
                                            style: {
                                                maxHeight: "500px",
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className='col-3'>
                                <div className='contact-top-controls'>
                                    <Button
                                        className='contact-top-controls__button px-6 uppercase'
                                        severity='success'
                                        type='button'
                                    >
                                        Export
                                    </Button>
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={() => printTableData(true)}
                                    />
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='icon adms-blank'
                                        onClick={() => printTableData()}
                                    />
                                </div>
                            </div>

                            <div className='col-7 text-right'>
                                <span className='p-input-icon-right'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        value={globalSearch}
                                        placeholder='Search'
                                        onChange={(e) => setGlobalSearch(e.target.value)}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className='grid'>
                            <div className='col-12'>
                                <DataTable
                                    showGridlines
                                    value={exportsToWeb}
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
                                    reorderableColumns
                                    resizableColumns
                                    sortOrder={lazyState.sortOrder}
                                    sortField={lazyState.sortField}
                                    onColReorder={(event) => {
                                        if (authUser && Array.isArray(event.columns)) {
                                            const orderArray = event.columns?.map(
                                                (column: any) => column.props.field
                                            );

                                            const newActiveColumns = orderArray
                                                .map((field: string) => {
                                                    return (
                                                        activeColumns.find(
                                                            (column) => column.field === field
                                                        ) || null
                                                    );
                                                })
                                                .filter(
                                                    (column): column is TableColumnsList =>
                                                        column !== null
                                                );

                                            setActiveColumns(newActiveColumns);

                                            changeSettings({
                                                activeColumns: newActiveColumns,
                                            });
                                        }
                                    }}
                                    onColumnResizeEnd={(event) => {
                                        if (authUser && event) {
                                            const newColumnWidth = {
                                                [event.column.props.field as string]:
                                                    event.element.offsetWidth,
                                            };
                                            changeSettings({
                                                columnWidth: {
                                                    ...serverSettings?.exportWeb?.columnWidth,
                                                    ...newColumnWidth,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    <Column
                                        bodyStyle={{ textAlign: "center" }}
                                        header={<Checkbox checked={false} />}
                                        reorderable={false}
                                        body={(options) => {
                                            return (
                                                <div className='flex gap-3'>
                                                    <Checkbox checked={false} />
                                                    <i
                                                        className='icon adms-edit-item cursor-pointer export-web__icon'
                                                        onClick={() => {
                                                            navigate(
                                                                `/dashboard/inventory/${options.itemuid}`
                                                            );
                                                        }}
                                                    />
                                                    <i className='pi pi-angle-down' />
                                                </div>
                                            );
                                        }}
                                    />
                                    {activeColumns.map(({ field, header }) => (
                                        <Column
                                            field={field}
                                            header={header}
                                            key={field}
                                            sortable
                                            editor={(data: ColumnEditorOptions) => {
                                                const { field } = data;
                                                if (
                                                    allowedEditableFields.includes(
                                                        field as keyof ExportWebList
                                                    )
                                                ) {
                                                    return cellEditor(data);
                                                } else {
                                                    return data.value;
                                                }
                                            }}
                                            headerClassName='cursor-move'
                                            pt={{
                                                root: {
                                                    style: {
                                                        width: serverSettings?.exportWeb
                                                            ?.columnWidth?.[field],
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                    },
                                                },
                                            }}
                                        />
                                    ))}
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
