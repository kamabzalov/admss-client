/* eslint-disable no-unused-vars */
import { ReactElement, useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import {
    DataTable,
    DataTableColReorderEvent,
    DataTableColumnResizeEndEvent,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
    DataTableValue,
} from "primereact/datatable";
import { QueryParams } from "common/models/query-params";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnProps } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import {
    addExportTask,
    addExportTaskToSchedule,
    getExportToWebList,
} from "http/services/export-to-web.service";
import { ExportWebList } from "common/models/export-web";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import {
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectPanelHeaderTemplateEvent,
} from "primereact/multiselect";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ExportWebUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { makeShortReports } from "http/services/reports.service";
import { ReportsColumn } from "common/models/reports";
import { FilterOptions, filterOptions } from "dashboard/common/filter";
import { createStringifyFilterQuery } from "common/helpers";
import { store } from "store";
import { Status } from "common/models/base-response";

interface TableColumnProps extends ColumnProps {
    field: keyof ExportWebList;
}

enum ExportToWebStatus {
    ALL = "allValues",
    SELECTED = "allSelected",
    UNSELECTED = "allUnselected",
}

const exportWebFilterOptions: FilterOptions[] = [
    { label: "Export To Web", value: "exportToWeb", bold: true, disabled: true },
    { label: "All", value: ExportToWebStatus.ALL },
    { label: "Selected", value: ExportToWebStatus.SELECTED },
    { label: "Unselected", value: ExportToWebStatus.UNSELECTED },
    ...filterOptions,
];

type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

const columns: TableColumnsList[] = [
    { field: "StockNo", header: "Stock#", checked: true },
    { field: "Year", header: "Year", checked: true },
    { field: "Make", header: "Make", checked: true },
    { field: "Model", header: "Model", checked: true },
    { field: "VIN", header: "VIN", checked: false },
    { field: "mileage", header: "Mileage", checked: false },
    { field: "Status", header: "Status", checked: false },
    { field: "Price", header: "Price", checked: false },
    { field: "lastexportdate", header: "Last Export Date", checked: false },
    { field: "mediacount", header: "Media (qty)", checked: false },
];

interface GroupedColumn {
    label: string;
    items: TableColumnsList[] | Pick<ColumnProps, "header" | "field">[];
}

const groupedColumns: GroupedColumn[] = [
    {
        label: "General",
        items: columns,
    },
];

interface ExportWebProps {
    countCb: (selected: number) => void;
}

export const ExportWeb = ({ countCb }: ExportWebProps): ReactElement => {
    const [exportsToWeb, setExportsToWeb] = useState<ExportWebList[]>([]);
    const userStore = store.userStore;
    const { authUser } = userStore;
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>([]);
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [selectedFilter, setSelectedFilter] = useState<Pick<FilterOptions, "value">[]>([]);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<FilterOptions[] | null>(
        null
    );
    const [selectedInventories, setSelectedInventories] = useState<boolean[]>([]);
    const [expandedRows, setExpandedRows] = useState<DataTableValue[]>([]);
    const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        countCb(selectedInventories.filter((item) => item).length);
    }, [selectedInventories, countCb]);

    const rowExpansionTemplate = (data: ExportWebList) => {
        return (
            <div className='expanded-row'>
                <div className='expanded-row__label'>Dealer comment: </div>
                <div className='expanded-row__text'>{data.DealerComments || ""}</div>
            </div>
        );
    };

    const handleRowExpansionClick = (data: ExportWebList) => {
        if (expandedRows.includes(data)) {
            setExpandedRows(expandedRows.filter((item) => item !== data));
            return;
        }
        setExpandedRows([...expandedRows, data]);
    };

    const handleGetExportWebList = async (params: QueryParams) => {
        if (!authUser) return;
        const [totalResponse, dataResponse] = await Promise.all([
            getExportToWebList(authUser.useruid, { ...params, total: 1 }),
            getExportToWebList(authUser.useruid, params),
        ]);

        if (totalResponse && !Array.isArray(totalResponse)) {
            setTotalRecords(totalResponse.total ?? 0);
        }

        if (Array.isArray(dataResponse)) {
            setExportsToWeb(dataResponse);
            setSelectedInventories(Array(dataResponse.length).fill(false));
        } else {
            setExportsToWeb([]);
        }
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
        changeSettings({ table: event as TableState });
    };

    const changeSettings = (settings: Partial<ExportWebUserSettings>) => {
        if (!authUser) return;
        const newSettings = {
            ...serverSettings,
            exportWeb: { ...serverSettings?.exportWeb, ...settings },
        } as ServerUserSettings;
        setUserSettings(authUser.useruid, newSettings).then((response) => {
            if (response?.status === Status.OK) setServerSettings(newSettings);
        });
    };

    useEffect(() => {
        if (!authUser) return;
        getUserSettings(authUser.useruid).then((response) => {
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
                const { exportWeb: settings } = allSettings;
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
                        sortField: settings.table.sortField || initialDataTableQueries.sortField,
                        sortOrder: settings.table.sortOrder || initialDataTableQueries.sortOrder,
                    });
                if (settings?.selectedFilterOptions) {
                    setSelectedFilterOptions(settings.selectedFilterOptions);
                }
            }
            setSettingsLoaded(true);
        });
    }, [authUser]);

    useEffect(() => {
        if (!settingsLoaded) return;
        if (selectedFilterOptions) {
            setSelectedFilter(selectedFilterOptions.map(({ value }) => value as any));
        }
        let qry: string = "";

        if (globalSearch) {
            qry += globalSearch;
        }

        if (selectedFilterOptions) {
            if (globalSearch.length) qry += "+";
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

        handleGetExportWebList(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalSearch, lazyState, selectedFilterOptions, settingsLoaded]);

    const handleCheckboxChange = () => {
        if (columns.length === activeColumns.length) {
            setActiveColumns(columns.filter(({ checked }) => checked));
            changeSettings({ activeColumns: [] });
        } else {
            setActiveColumns(columns);
            changeSettings({
                activeColumns: columns.map(({ field }) => field),
            });
        }
    };

    const dropdownHeaderPanel = (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    checked={columns.length === activeColumns.length}
                    onChange={handleCheckboxChange}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={() => {
                    changeSettings({ activeColumns: [] });
                    return setActiveColumns(columns.filter(({ checked }) => checked));
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );

    const dropdownFilterHeaderPanel = (evt: MultiSelectPanelHeaderTemplateEvent) => {
        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        checked={
                            exportWebFilterOptions.filter((option) => !option.disabled).length ===
                            selectedFilter.length
                        }
                        onChange={(e) => {
                            const isChecked = e.target.checked;
                            setSelectedFilter(
                                isChecked
                                    ? exportWebFilterOptions.map((option) => ({
                                          value: option.value,
                                      }))
                                    : []
                            );
                            const selectedOptions = isChecked ? exportWebFilterOptions : [];
                            setSelectedFilterOptions(
                                selectedOptions.filter((option) => !option.disabled)
                            );
                        }}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    className='p-multiselect-close p-link'
                    onClick={(e) => {
                        setSelectedFilter([]);
                        setSelectedFilterOptions([]);
                        changeSettings({
                            selectedFilterOptions: [],
                        });
                        evt.onCloseClick(e);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

    const printTableData = async (print: boolean = false) => {
        const columns: ReportsColumn[] = activeColumns.map((column) => ({
            name: column.header as string,
            data: column.field,
        }));
        const date = new Date();
        const name = `export-web_${
            date.getMonth() + 1
        }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

        if (authUser) {
            const data = exportsToWeb.map((item) => {
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

    const handleExport = (schedule?: boolean) => {
        const columns: ReportsColumn[] = activeColumns.map((column) => ({
            name: column.header as string,
            data: column.field,
        }));
        const data = exportsToWeb
            .map((item, index) => {
                let filteredItem: Record<string, any> | null = {};
                columns.forEach((column) => {
                    if (item.hasOwnProperty(column.data)) {
                        if (selectedInventories[index] && filteredItem) {
                            filteredItem[column.data] = item[column.data as keyof typeof item];
                            filteredItem["itemuid"] = item["itemuid"];
                        } else {
                            filteredItem = null;
                        }
                    }
                });
                return filteredItem;
            })
            .filter(Boolean);
        const JSONreport = !!data.length && {
            data,
            columns,
        };
        if (JSONreport && authUser) {
            if (schedule) {
                addExportTaskToSchedule(authUser.useruid, JSONreport);
            } else {
                addExportTask(authUser?.useruid, JSONreport);
            }
        }
    };

    const handleColumnReorder = (event: DataTableColReorderEvent) => {
        if (authUser && Array.isArray(event.columns)) {
            const orderArray = event.columns?.map((column: any) => column.props.field);

            const newActiveColumns = orderArray
                .map((field: string) => {
                    return activeColumns.find((column) => column.field === field) || null;
                })
                .filter((column): column is TableColumnsList => column !== null);

            setActiveColumns(newActiveColumns);

            changeSettings({
                activeColumns: newActiveColumns,
            });
        }
    };

    const handleColumnResize = (event: DataTableColumnResizeEndEvent) => {
        if (event.column.props.field) {
            const newColumnWidth = {
                [event.column.props.field as string]: event.element.offsetWidth,
            };
            changeSettings({
                columnWidth: {
                    ...serverSettings?.exportWeb?.columnWidth,
                    ...newColumnWidth,
                },
            });
        }
    };

    const handleChangeColumn = ({ value, stopPropagation }: MultiSelectChangeEvent) => {
        stopPropagation();
        const sortedValue = value.sort((a: TableColumnsList, b: TableColumnsList) => {
            const firstIndex = columns.findIndex((col) => col.field === a.field);
            const secondIndex = columns.findIndex((col) => col.field === b.field);
            return firstIndex - secondIndex;
        });

        setActiveColumns(sortedValue);

        changeSettings({
            activeColumns: value.map(({ field }: { field: string }) => field),
        });
    };

    const handleChangeFilter = ({ value }: MultiSelectChangeEvent) => {
        const selectedOptions = exportWebFilterOptions.filter((option) =>
            value.includes(option.value)
        );
        setSelectedFilterOptions(selectedOptions);

        changeSettings({
            selectedFilterOptions: selectedOptions,
        });
    };

    return (
        <div className='card-content'>
            <div className='grid datatable-controls'>
                <div className='col-12 export-web-controls'>
                    <Button
                        className='export-web-controls__button px-6 uppercase'
                        severity='success'
                        type='button'
                        disabled={selectedInventories.filter(Boolean).length === 0}
                        onClick={() => handleExport()}
                    >
                        Export now
                    </Button>
                    <Button
                        className='export-web-controls__button px-6 uppercase'
                        severity='success'
                        type='button'
                        disabled={selectedInventories.filter(Boolean).length === 0}
                        onClick={() => handleExport(true)}
                        tooltip='Add to schedule'
                    >
                        Add to
                        <i className='icon adms-calendar export-web-controls__button-icon' />
                    </Button>
                    <div className='export-web-controls__input'>
                        <MultiSelect
                            optionValue='value'
                            optionLabel='label'
                            options={exportWebFilterOptions}
                            value={selectedFilter}
                            onChange={handleChangeFilter}
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
                    <div className='export-web-controls__input'>
                        <MultiSelect
                            options={groupedColumns}
                            value={activeColumns}
                            optionGroupChildren='items'
                            optionLabel='header'
                            optionGroupLabel='label'
                            panelHeaderTemplate={dropdownHeaderPanel}
                            onChange={handleChangeColumn}
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
                    <Button
                        severity='success'
                        type='button'
                        icon='icon adms-print'
                        tooltip='Print export to web form'
                        onClick={() => printTableData(true)}
                    />
                    <Button
                        severity='success'
                        type='button'
                        icon='pi pi-download'
                        tooltip='Download export to web form'
                        onClick={() => printTableData()}
                    />
                    <span className='p-input-icon-right ml-auto'>
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
                        totalRecords={totalRecords || 1}
                        onPage={pageChanged}
                        onSort={sortData}
                        rowExpansionTemplate={rowExpansionTemplate}
                        expandedRows={expandedRows}
                        onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                        reorderableColumns
                        resizableColumns
                        sortOrder={lazyState.sortOrder}
                        className='export-web-table'
                        sortField={lazyState.sortField}
                        onColReorder={handleColumnReorder}
                        onColumnResizeEnd={handleColumnResize}
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            header={
                                <Checkbox
                                    checked={selectedInventories.every((checkbox) => !!checkbox)}
                                    onClick={({ checked }) => {
                                        setSelectedInventories(
                                            selectedInventories.map(() => !!checked)
                                        );
                                    }}
                                />
                            }
                            reorderable={false}
                            resizeable={false}
                            body={(options, { rowIndex }) => {
                                return (
                                    <div
                                        className={`flex gap-3 align-items-center  ${
                                            selectedInventories[rowIndex] && "row--selected"
                                        }`}
                                    >
                                        <Checkbox
                                            checked={selectedInventories[rowIndex]}
                                            onClick={() => {
                                                setSelectedInventories(
                                                    selectedInventories.map((state, index) =>
                                                        index === rowIndex ? !state : state
                                                    )
                                                );
                                            }}
                                        />

                                        <Button
                                            className='text export-web__icon-button'
                                            icon='icon adms-edit-item'
                                            onClick={() => {
                                                navigate(`/dashboard/inventory/${options.itemuid}`);
                                            }}
                                        />
                                        <Button
                                            className='text export-web__icon-button'
                                            icon='pi pi-angle-down'
                                            onClick={() => handleRowExpansionClick(options)}
                                        />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "100px",
                                    },
                                },
                            }}
                        />
                        {activeColumns.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                sortable
                                body={(data, { rowIndex }) => {
                                    return (
                                        <div
                                            className={`${
                                                selectedInventories[rowIndex] && "row--selected"
                                            }`}
                                        >
                                            {data[field]}
                                        </div>
                                    );
                                }}
                                headerClassName='cursor-move'
                                pt={{
                                    root: {
                                        style: {
                                            width: serverSettings?.exportWeb?.columnWidth?.[field],
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
    );
};
