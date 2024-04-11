import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
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
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { ROWS_PER_PAGE } from "common/settings";
import { AdvancedSearchDialog, SearchField } from "dashboard/common/dialog/search";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { FilterOptions, TableColumnsList, columns, filterOptions } from "./common/data-table";
import { InventoryUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { makeShortReports } from "http/services/reports.service";
import { Checkbox } from "primereact/checkbox";
import { ReportsColumn } from "common/models/reports";

interface AdvancedSearch extends Pick<Partial<Inventory>, "StockNo" | "Make" | "Model" | "VIN"> {}

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

const createStringifyFilterQuery = (filterArray: FilterOptions[]): string => {
    let qry: string = "";
    filterArray.forEach((option, index) => {
        const { column, value } = option;
        if (value.includes("-")) {
            const [wordFrom, wordTo] = value.split("-");
            return (qry += `${index > 0 ? "+" : ""}${wordFrom}.${wordTo}.${column}`);
        }
        qry += `${index > 0 ? "+" : ""}${value}.${column}`;
    });
    return qry;
};

export default function Inventories(): ReactElement {
    const [inventories, setInventories] = useState<Inventory[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [advancedSearch, setAdvancedSearch] = useState<AdvancedSearch>({});
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const [selectedFilter, setSelectedFilter] = useState<Pick<FilterOptions, "value">[]>([]);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<FilterOptions[] | null>(
        null
    );
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>([]);

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
            getInventoryList(authUser.useruid, { total: 1 }).then((response) => {
                response && !Array.isArray(response) && setTotalRecords(response.total ?? 0);
            });
        }
    }, []);

    useEffect(() => {
        changeSettings({ activeColumns: activeColumns.map(({ field }) => field) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeColumns]);

    useEffect(() => {
        if (selectedFilterOptions) {
            setSelectedFilter(selectedFilterOptions.map(({ value }) => value as any));
        }
        let qry: string = "";

        if (globalSearch) {
            qry += globalSearch;
        } else {
            qry += createStringifySearchQuery(advancedSearch);
        }

        if (selectedFilterOptions) {
            if (globalSearch.length || Object.values(advancedSearch).length) qry += "+";
            qry += createStringifyFilterQuery(selectedFilterOptions);
        }

        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            qry,
            skip: lazyState.first,
            top: lazyState.rows,
        };

        handleGetInventoryList(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lazyState, globalSearch, authUser, selectedFilterOptions]);

    useEffect(() => {
        if (authUser) {
            getUserSettings(authUser.useruid).then((response) => {
                if (response?.profile.length) {
                    const allSettings: ServerUserSettings = JSON.parse(response.profile);
                    setServerSettings(allSettings);
                    const { inventory: settings } = allSettings;
                    if (settings?.activeColumns?.length) {
                        const uniqueColumns = Array.from(new Set(settings?.activeColumns));
                        const serverColumns = columns.filter((column) =>
                            uniqueColumns.find((col) => col === column.field)
                        );
                        setActiveColumns(serverColumns);
                    } else {
                        setActiveColumns(columns.filter(({ checked }) => checked));
                    }
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
                    if (settings?.selectedFilterOptions) {
                        setSelectedFilterOptions(settings.selectedFilterOptions);
                    }
                }
            });
        }
    }, [authUser]);

    const printTableData = async (print: boolean = false) => {
        const columns: ReportsColumn[] = activeColumns.map((column) => ({
            name: column.header as string,
            data: column.field as string,
        }));
        const date = new Date();
        const name = `inventory_${
            date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

        if (authUser) {
            const data = inventories.map((item) => {
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
    };

    const changeSettings = (settings: Partial<InventoryUserSettings>) => {
        if (authUser) {
            const newSettings = {
                ...serverSettings,
                inventory: { ...serverSettings?.inventory, ...settings },
            } as ServerUserSettings;
            setServerSettings(newSettings);
            setUserSettings(authUser.useruid, newSettings);
        }
    };

    const onColumnToggle = ({ value }: MultiSelectChangeEvent) => {
        return setActiveColumns(value);
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

    const dropdownHeaderPanel = (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    checked={columns.length === activeColumns.length}
                    onChange={() => {
                        setActiveColumns(columns);
                    }}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={() => {
                    return setActiveColumns(columns.filter(({ checked }) => checked));
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );

    const dropdownFilterHeaderPanel = (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    checked={filterOptions.length === selectedFilter.length}
                    onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectedFilter(
                            isChecked
                                ? filterOptions.map((option) => ({ value: option.value }))
                                : []
                        );
                        const selectedOptions = isChecked ? filterOptions : [];
                        setSelectedFilterOptions(
                            selectedOptions.filter((option) => !option.disabled)
                        );
                        changeSettings({
                            ...serverSettings,
                            selectedFilterOptions: selectedOptions,
                        });
                    }}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={() => {
                    setSelectedFilter([]);
                    setSelectedFilterOptions([]);
                    changeSettings({
                        ...serverSettings,
                        selectedFilterOptions: [],
                    });
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );

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

                        changeSettings({
                            ...serverSettings,
                            selectedFilterOptions: selectedOptions,
                        });
                    }}
                    placeholder='Filter'
                    className='w-full pb-0 h-full flex align-items-center inventory-filter'
                    display='chip'
                    selectedItemsLabel='Clear Filter'
                    panelHeaderTemplate={dropdownFilterHeaderPanel}
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
                    panelHeaderTemplate={dropdownHeaderPanel}
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
                <div className='inventory-top-controls'>
                    <Button
                        className='inventory-top-controls__button new-inventory-button'
                        icon='icon adms-add-item'
                        severity='success'
                        type='button'
                        tooltip='Add new inventory'
                        onClick={() => navigate("create")}
                    >
                        New
                    </Button>
                    <Button
                        severity='success'
                        type='button'
                        icon='pi pi-print'
                        tooltip='Print inventory form'
                        onClick={() => printTableData(true)}
                    />
                    <Button
                        severity='success'
                        type='button'
                        icon='icon adms-blank'
                        tooltip='Download inventory form'
                        onClick={() => printTableData()}
                    />
                </div>
            </div>
            <div className='col-5 text-right'>
                <Button
                    className='inventory-top-controls__button m-r-20px'
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
                                    onColReorder={(event: any) => {
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
                                                    (column: any): column is TableColumnsList =>
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
                                                    ...serverSettings?.inventory?.columnWidth,
                                                    ...newColumnWidth,
                                                },
                                            });
                                        }
                                    }}
                                >
                                    {activeColumns.map(({ field, header }) => {
                                        return (
                                            <Column
                                                field={field}
                                                header={header}
                                                key={field}
                                                sortable
                                                reorderable
                                                headerClassName='cursor-move'
                                                pt={{
                                                    root: {
                                                        style: {
                                                            width: serverSettings?.inventory
                                                                ?.columnWidth?.[field],
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                        },
                                                    },
                                                }}
                                            />
                                        );
                                    })}
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
