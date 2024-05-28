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
import { Column, ColumnEditorOptions, ColumnProps } from "primereact/column";
import { LS_APP_USER } from "common/constants/localStorage";
import { ROWS_PER_PAGE } from "common/settings";
import {
    addExportTask,
    addExportTaskToSchedule,
    getExportToWebList,
} from "http/services/export-to-web.service";
import { ExportWebList } from "common/models/export-web";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import "./index.css";
import { setInventory } from "http/services/inventory-service";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ExportWebUserSettings, ServerUserSettings, TableState } from "common/models/user";
import { makeShortReports } from "http/services/reports.service";
import { ReportsColumn } from "common/models/reports";
import { FilterOptions, TableFilter, filterOptions } from "dashboard/common/filter";
import { createStringifyFilterQuery } from "common/helpers";

interface TableColumnProps extends ColumnProps {
    field: keyof ExportWebList;
}

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

export const ExportToWeb = () => {
    const [exportsToWeb, setExportsToWeb] = useState<ExportWebList[]>([]);
    const [authUser, setUser] = useState<AuthUser | null>(null);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>([]);
    const [serverSettings, setServerSettings] = useState<ServerUserSettings>();
    const [, setSelectedFilter] = useState<Pick<FilterOptions, "value">[]>([]);
    const [selectedFilterOptions, setSelectedFilterOptions] = useState<FilterOptions[] | null>(
        null
    );
    const [selectedInventories, setSelectedInventories] = useState<boolean[]>([]);
    const [expandedRows, setExpandedRows] = useState<any[]>([]);

    const navigate = useNavigate();

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

    const handleGetExportWebList = async (params: QueryParams, total?: boolean) => {
        if (authUser) {
            if (total) {
                getExportToWebList(authUser.useruid, { ...params, total: 1 }).then((response) => {
                    if (response && !Array.isArray(response)) {
                        setTotalRecords(response.total ?? 0);
                    }
                });
            }
            getExportToWebList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setExportsToWeb(response);
                    setSelectedInventories(Array(response.length).fill(false));
                } else {
                    setExportsToWeb([]);
                }
            });
        }
    };

    useEffect(() => {
        changeSettings({ activeColumns: activeColumns.map(({ field }) => field) });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeColumns]);

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
    }, [lazyState, globalSearch, authUser, selectedFilterOptions]);

    const changeSettings = (settings: Partial<ExportWebUserSettings>) => {
        if (authUser) {
            const newSettings = {
                ...serverSettings,
                inventory: { ...serverSettings?.inventory, ...settings },
            } as ServerUserSettings;
            setServerSettings(newSettings);
            setUserSettings(authUser.useruid, newSettings);
        }
    };

    useEffect(() => {
        if (authUser) {
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
                            sortField:
                                settings.table.sortField || initialDataTableQueries.sortField,
                            sortOrder:
                                settings.table.sortOrder || initialDataTableQueries.sortOrder,
                        });
                }
            });
        }
    }, [authUser]);

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

    const onColumnToggle = ({ value }: MultiSelectChangeEvent) => {
        return setActiveColumns(value);
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
                                    <TableFilter
                                        filterOptions={filterOptions}
                                        onFilterChange={(selectedFilter) => {
                                            changeSettings({
                                                ...serverSettings,
                                                selectedFilterOptions: selectedFilter.filter(
                                                    (option) => !option.disabled
                                                ),
                                            });
                                        }}
                                        onClearFilters={() => {
                                            setSelectedFilter([]);
                                            setSelectedFilterOptions([]);
                                            changeSettings({
                                                ...serverSettings,
                                                selectedFilterOptions: [],
                                            });
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
                                    icon='icon adms-blank'
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
                                    totalRecords={totalRecords}
                                    onPage={pageChanged}
                                    onSort={sortData}
                                    rowExpansionTemplate={rowExpansionTemplate}
                                    expandedRows={expandedRows}
                                    onRowToggle={(e: DataTableRowClickEvent) =>
                                        setExpandedRows([e.data])
                                    }
                                    reorderableColumns
                                    resizableColumns
                                    sortOrder={lazyState.sortOrder}
                                    className='export-web-table'
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
                                        header={
                                            <Checkbox
                                                checked={selectedInventories.every(
                                                    (checkbox) => !!checkbox
                                                )}
                                                onClick={({ checked }) => {
                                                    setSelectedInventories(
                                                        selectedInventories.map(() => {
                                                            if (checked) {
                                                                return true;
                                                            } else {
                                                                return false;
                                                            }
                                                        })
                                                    );
                                                }}
                                            />
                                        }
                                        reorderable={false}
                                        body={(options, { rowIndex }) => {
                                            return (
                                                <div
                                                    className={`flex gap-3 align-items-center  ${
                                                        selectedInventories[rowIndex] &&
                                                        "row--selected"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={selectedInventories[rowIndex]}
                                                        onClick={() => {
                                                            setSelectedInventories(
                                                                selectedInventories.map(
                                                                    (state, index) =>
                                                                        index === rowIndex
                                                                            ? !state
                                                                            : state
                                                                )
                                                            );
                                                        }}
                                                    />

                                                    <Button
                                                        className='text export-web__icon-button'
                                                        icon='icon adms-edit-item'
                                                        onClick={() => {
                                                            navigate(
                                                                `/dashboard/inventory/${options.itemuid}`
                                                            );
                                                        }}
                                                    />
                                                    <Button
                                                        className='text export-web__icon-button'
                                                        icon='pi pi-angle-down'
                                                        onClick={() =>
                                                            handleRowExpansionClick(options)
                                                        }
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
                                                            selectedInventories[rowIndex] &&
                                                            "row--selected"
                                                        }`}
                                                    >
                                                        {data[field]}
                                                    </div>
                                                );
                                            }}
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
