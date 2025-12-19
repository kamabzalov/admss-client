import { ReactElement, useEffect, useRef, useState } from "react";
import {
    DataTable,
    DataTableColReorderEvent,
    DataTableColumnResizeEndEvent,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { getInventoryList, getInventoryLocations } from "http/services/inventory-service";
import { Inventory, InventoryLocations } from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { Column } from "primereact/column";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { useNavigate } from "react-router-dom";
import "./index.css";
import InventoryHeader from "dashboard/inventory/components/InventoryHeader";
import { ROWS_PER_PAGE } from "common/settings";
import { InventoryAdvancedSearch } from "dashboard/inventory/components/AdvancedSearch";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import {
    FilterOptions,
    TableColumnsList,
    columns,
    filterOptions,
} from "dashboard/inventory/common/data-table";
import { InventoryUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { useCreateReport, useToastMessage } from "common/hooks";
import { createStringifyFilterQuery } from "common/helpers";
import { Loader } from "dashboard/common/loader";
import { SplitButton } from "primereact/splitbutton";
import { useStore } from "store/hooks";
import { INVENTORY_PAGE } from "common/constants/links";
import { Button } from "primereact/button";
import { TruncatedText } from "dashboard/common/display";
import { DataTableWrapper } from "dashboard/common/data-table";
import { getColumnPtStyles } from "dashboard/common/data-table";

const DATA_FIELD = "data-field";

interface InventoriesProps {
    onRowClick?: (companyName: string) => void;
    returnedField?: keyof Inventory;
    getFullInfo?: (inventory: Inventory) => void;
    originalPath?: string;
}

const UPPER_CASE_FIELDS = ["Make", "Model", "VIN"];

export default function Inventories({
    onRowClick,
    returnedField,
    getFullInfo,
    originalPath,
}: InventoriesProps): ReactElement {
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);

    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    const [selectedFilter, setSelectedFilter] = useState<Pick<FilterOptions, "value">[]>([]);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<FilterOptions[] | null>(
        null
    );
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [settingsInitialized, setSettingsInitialized] = useState<boolean>(false);
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [locations, setLocations] = useState<InventoryLocations[]>([]);
    const [currentLocation, setCurrentLocation] = useState<InventoryLocations>(
        {} as InventoryLocations
    );
    const [selectedInventoryType, setSelectedInventoryType] = useState<string[]>([]);
    const dataTableRef = useRef<DataTable<Inventory[]>>(null);
    const [columnWidths, setColumnWidths] = useState<{ field: string; width: number }[]>([]);
    const store = useStore().inventoryStore;
    const { clearInventory, inventoryGroupClassList, getInventoryGroupClassList } = store;
    const { showError } = useToastMessage();
    const { createReport } = useCreateReport<Inventory>();

    const navigate = useNavigate();

    const getInventoryInfo = async () => {
        if (!authUser) return;

        const locationsResponse = await getInventoryLocations(authUser.useruid);
        if (locationsResponse && Array.isArray(locationsResponse)) {
            setLocations(locationsResponse);
        }
        await getInventoryGroupClassList();
        if (inventoryGroupClassList.length > 0) {
            setSelectedInventoryType(inventoryGroupClassList.map((group) => group.description));
        }
    };

    useEffect(() => {
        if (dataTableRef.current) {
            const table = dataTableRef.current.getTable();
            const columns = table.querySelectorAll("th");
            const columnWidths = Array.from(columns).map((column) => {
                const field = column!
                    .querySelector(`span[${DATA_FIELD}]`)
                    ?.getAttribute(DATA_FIELD);
                return {
                    field: field!,
                    width: column.offsetWidth,
                };
            });
            setColumnWidths(columnWidths);
        }
    }, [inventories, activeColumns]);

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    useEffect(() => {
        getInventoryInfo();
        return () => {
            store.isErasingNeeded = true;
            if (originalPath) {
                store.memoRoute = originalPath;
            }
            clearInventory();
        };
    }, []);

    useEffect(() => {
        const loadSettings = async () => {
            if (authUser && locations.length > 0) {
                setIsLoading(true);
                try {
                    const response = await getUserSettings(authUser.useruid);
                    if (response?.profile.length) {
                        let allSettings: ServerUserSettings = {} as ServerUserSettings;
                        if (response.profile) {
                            try {
                                allSettings = JSON.parse(response.profile);
                            } catch (error) {
                                allSettings = {} as ServerUserSettings;
                            }
                        }
                        setServerSettings(allSettings);
                        const { inventory: settings } = allSettings;
                        if (settings?.activeColumns?.length) {
                            const uniqueColumns = Array.from(new Set(settings.activeColumns));
                            const serverColumns = uniqueColumns
                                .map((field) => columns.find((column) => column.field === field))
                                .filter((foundColumn): foundColumn is TableColumnsList =>
                                    Boolean(foundColumn)
                                );
                            setActiveColumns(serverColumns);
                        } else {
                            setActiveColumns(columns.filter(({ checked }) => checked));
                        }
                        if (settings?.table) {
                            const table = settings.table;
                            setLazyState({
                                first: table.first || initialDataTableQueries.first,
                                rows: table.rows || initialDataTableQueries.rows,
                                page: table.page || initialDataTableQueries.page,
                                column: table.column || initialDataTableQueries.column,
                                sortField: table.sortField || initialDataTableQueries.sortField,
                                sortOrder: table.sortOrder || initialDataTableQueries.sortOrder,
                            });
                        }
                        if (settings?.selectedFilterOptions) {
                            setSelectedFilterOptions(settings.selectedFilterOptions);
                        }
                        if (settings?.selectedInventoryType) {
                            setSelectedInventoryType(settings.selectedInventoryType);
                        }
                        if (settings?.currentLocation) {
                            const location = locations.find(
                                (location) => location.locationuid === settings.currentLocation
                            );
                            setCurrentLocation(location || ({} as InventoryLocations));
                            store.currentLocation = location?.locationuid || "";
                        }
                        setSettingsInitialized(true);
                    }
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadSettings();
    }, [authUser, locations, store, initialDataTableQueries]);

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        await createReport({
            userId: authUser.useruid,
            items: inventories,
            columns: activeColumns.map((activeColumn) => ({
                field: activeColumn.field as keyof Inventory,
                header: String(activeColumn.header),
            })),
            widths: columnWidths,
            print,
            name: "inventory",
        });
    };

    const changeSettings = (settings: Partial<InventoryUserSettings>) => {
        if (authUser) {
            if (settings.activeColumns) {
                const filteredSettings = serverSettings?.inventory?.columnWidth
                    ? Object.entries(serverSettings.inventory?.columnWidth)
                          .filter(([column]) =>
                              settings.activeColumns?.some((col) => col === column)
                          )
                          .reduce(
                              (obj, [key, value]) => {
                                  return {
                                      ...obj,
                                      [key]: value,
                                  };
                              },
                              {} as { [key: string]: number }
                          )
                    : {};
                const updatedSettings = {
                    ...serverSettings,
                    inventory: {
                        ...serverSettings?.inventory,
                        ...settings,
                        columnWidth: filteredSettings,
                    },
                } as ServerUserSettings;

                setServerSettings(updatedSettings);
                setUserSettings(authUser.useruid, updatedSettings);
            } else {
                const newSettings = {
                    ...serverSettings,
                    inventory: { ...serverSettings?.inventory, ...settings },
                } as ServerUserSettings;
                setServerSettings(newSettings);
                setUserSettings(authUser.useruid, newSettings);
            }
        }
    };

    const handleGetInventoryList = async (params: QueryParams, total?: boolean) => {
        if (!authUser) return;

        const queryString = params.qry ? encodeURIComponent(params.qry) : "";
        const updatedParams = { ...params, qry: queryString };

        setIsLoading(true);
        try {
            if (total) {
                const totalResponse = await getInventoryList(authUser.useruid, {
                    ...updatedParams,
                    total: 1,
                });
                if (totalResponse && !Array.isArray(totalResponse)) {
                    setTotalRecords(totalResponse.total ?? 0);
                }
            }

            const response = await getInventoryList(authUser.useruid, updatedParams);
            if (Array.isArray(response)) {
                setInventories(response);
            }
        } catch (error) {
            showError(String(error) || "Failed to load inventory data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!authUser || !settingsInitialized || !locations.length) return;

        if (selectedFilterOptions) {
            setSelectedFilter(
                selectedFilterOptions.map(
                    ({ value }) => value as unknown as Pick<FilterOptions, "value">
                )
            );
        }
        let qry: string = "";

        if (globalSearch) {
            qry += globalSearch;
        }

        if (selectedFilterOptions) {
            if (globalSearch.length) qry += "+";
            qry += createStringifyFilterQuery(selectedFilterOptions);
        }

        if (selectedInventoryType.length) {
            if (globalSearch.length || selectedFilterOptions) qry += "+";
            selectedInventoryType.forEach(
                (type, index) =>
                    (qry += `${type}.GroupClass${
                        index !== selectedInventoryType.length - 1 ? "+" : ""
                    }`)
            );
        }

        if (Object.values(currentLocation).some((value) => value.trim().length)) {
            if (!!qry.length) qry += "+";
            qry += `${currentLocation.locationuid}.locationuid`;
        }

        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip:
                typeof lazyState.first === "number"
                    ? lazyState.first
                    : initialDataTableQueries.first,
            top: typeof lazyState.rows === "number" ? lazyState.rows : initialDataTableQueries.rows,
        };

        if (qry.length > 0) {
            params.qry = qry;
        }

        handleGetInventoryList(params, true);
    }, [
        settingsInitialized,
        globalSearch,
        selectedFilterOptions,
        currentLocation,
        selectedInventoryType,
        authUser,
        locations.length,
        lazyState.first,
        lazyState.rows,
        lazyState.sortField,
        lazyState.sortOrder,
    ]);

    const handleAddNewInventory = () => {
        navigate(INVENTORY_PAGE.CREATE());
    };

    const handleFormatField = (field: string, value: string) => {
        const currentCurrencySymbol = "$";
        if (UPPER_CASE_FIELDS.includes(field)) {
            return value.toUpperCase();
        }
        if (field === "Price" && !value.includes(currentCurrencySymbol)) {
            return `${currentCurrencySymbol} ${value}`;
        }
        return value;
    };

    const header = (
        <InventoryHeader
            searchValue={globalSearch}
            onSearchChange={(nextValue: string) => setGlobalSearch(nextValue)}
            onAdvancedSearch={() => setDialogVisible(true)}
            onAddNew={handleAddNewInventory}
            onPrint={() => printTableData(true)}
            onDownload={() => printTableData(false)}
            filterOptions={filterOptions}
            selectedFilterValues={selectedFilter}
            onFilterOptionsChange={(nextSelected: FilterOptions[]) => {
                setSelectedFilterOptions(nextSelected);
                changeSettings({ selectedFilterOptions: nextSelected });
            }}
            availableColumns={columns}
            activeColumns={activeColumns}
            onActiveColumnsChange={(nextColumns: TableColumnsList[]) => {
                setActiveColumns(nextColumns);
                changeSettings({ activeColumns: nextColumns.map(({ field }) => field) });
            }}
            inventoryTypes={inventoryGroupClassList}
            selectedInventoryTypes={selectedInventoryType}
            onInventoryTypesChange={(nextTypes: string[]) => {
                setSelectedInventoryType(nextTypes);
                changeSettings({ selectedInventoryType: nextTypes });
            }}
        />
    );

    const columnHeader = (title: string, field: string) => {
        return <span data-field={field}>{title}</span>;
    };

    const columnEditButton = (itemuid: string) => {
        return (
            <Button
                text
                className='table-edit-button'
                icon='adms-edit-item'
                tooltip='Edit inventory'
                tooltipOptions={{ position: "mouse" }}
                onClick={() => navigate(INVENTORY_PAGE.EDIT(itemuid))}
            />
        );
    };

    const handleColumnReorder = (event: DataTableColReorderEvent) => {
        if (Array.isArray(event.columns)) {
            const orderArray = event.columns?.map((column: Column) => column.props.field);

            const newActiveColumns = orderArray
                .map((field: string | undefined) => {
                    return activeColumns.find((column) => column.field === field) || null;
                })
                .filter(
                    (column: TableColumnsList | null): column is TableColumnsList => column !== null
                );

            setActiveColumns(newActiveColumns);

            changeSettings({
                activeColumns: newActiveColumns.map(({ field }) => field),
            });
        }
    };

    const handleColumnResize = (event: DataTableColumnResizeEndEvent) => {
        if (event.column.props.field) {
            const newColumnWidth = {
                [event.column.props.field as string]: event.element.offsetWidth,
            };
            changeSettings({
                columnWidth: { ...serverSettings?.inventory?.columnWidth, ...newColumnWidth },
            });
        }
    };

    const handleOnRowClick = ({ data }: DataTableRowClickEvent): void => {
        const selectedText = window.getSelection()?.toString();

        if (!!selectedText?.length) {
            return;
        }

        if (getFullInfo) {
            getFullInfo(data as Inventory);
        }
        if (onRowClick) {
            const value = returnedField ? data[returnedField] : data.Make;
            onRowClick(value);
        } else {
            navigate(data.itemuid);
        }
    };

    return (
        <DataTableWrapper className='card inventory'>
            <div className='card-header'>
                <h2 className='card-header__title inventory__title uppercase m-0'>Inventory</h2>
                {locations.length > 0 && (
                    <SplitButton
                        label={currentLocation?.locName || "Any Location"}
                        className='inventory-location'
                        model={[
                            {
                                label: "Any Location",
                                command: () => {
                                    setCurrentLocation({} as InventoryLocations);
                                    changeSettings({
                                        currentLocation: "",
                                    });
                                },
                            },
                            ...locations.map((location) => ({
                                label: location.locName,
                                command: () => {
                                    setCurrentLocation(location);
                                    changeSettings({
                                        currentLocation: location.locationuid,
                                    });

                                    store.currentLocation = location.locationuid;
                                },
                            })),
                        ]}
                        rounded
                        menuStyle={{ transform: "translateX(164px)" }}
                        pt={{
                            menu: {
                                className: "inventory-location__menu",
                            },
                        }}
                    />
                )}
            </div>
            <div className='card-content'>
                {isLoading ? (
                    <div className='dashboard-loader__wrapper'>
                        <Loader />
                    </div>
                ) : (
                    <DataTable
                        ref={dataTableRef}
                        showGridlines
                        value={inventories}
                        lazy
                        paginator
                        scrollable
                        scrollHeight='auto'
                        first={lazyState.first}
                        rows={lazyState.rows}
                        rowsPerPageOptions={ROWS_PER_PAGE}
                        totalRecords={totalRecords || 1}
                        onPage={pageChanged}
                        onSort={sortData}
                        sortOrder={lazyState.sortOrder}
                        sortField={lazyState.sortField}
                        reorderableColumns
                        resizableColumns
                        header={header}
                        rowClassName={() => "table-row"}
                        onColReorder={handleColumnReorder}
                        onColumnResizeEnd={handleColumnResize}
                        onRowClick={handleOnRowClick}
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            reorderable={false}
                            resizeable={false}
                            body={columnEditButton}
                            className='table-edit-button-column'
                        />
                        {activeColumns.map(({ field, header }, index) => {
                            const savedWidth = serverSettings?.inventory?.columnWidth?.[field];
                            const isLastColumn = index === activeColumns.length - 1;

                            return (
                                <Column
                                    field={field}
                                    header={() => columnHeader(header as string, field)}
                                    key={field}
                                    sortable
                                    reorderable
                                    headerClassName='cursor-move'
                                    body={(data) => {
                                        const value = handleFormatField(field, data[field]);
                                        return <TruncatedText text={value} withTooltip />;
                                    }}
                                    pt={getColumnPtStyles({
                                        savedWidth,
                                        isLastColumn,
                                    })}
                                />
                            );
                        })}
                    </DataTable>
                )}
                <InventoryAdvancedSearch
                    visible={dialogVisible}
                    onClose={() => setDialogVisible(false)}
                    lazyState={lazyState}
                    setIsLoading={setIsLoading}
                    handleGetInventoryList={handleGetInventoryList}
                />
            </div>
        </DataTableWrapper>
    );
}
