import React, { useEffect, useMemo, useState, ReactElement } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { DataTable, DataTablePageEvent, DataTableSortEvent } from "primereact/datatable";
import { QueryParams } from "common/models/query-params";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { getDealsList } from "http/services/deals.service";
import { ROWS_PER_PAGE } from "common/settings";
import { Deal, TotalDealsList } from "common/models/deals";
import { Loader } from "dashboard/common/loader";
import {
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectPanelHeaderTemplateEvent,
} from "primereact/multiselect";
import { ChipMultiSelect } from "dashboard/common/form/chip-multiselect";
import {
    AdvancedSearchDialog,
    SEARCH_FORM_TYPE,
    SearchField,
    SEARCH_FIELD_TYPE,
} from "dashboard/common/dialog/search";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import "./index.css";
import { BUTTON_VARIANTS, ControlButton } from "dashboard/common/button";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { TruncatedText } from "dashboard/common/display";
import { useCreateReport, useToastMessage } from "common/hooks";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { LeadsUserSettings } from "common/models/user";
import { getColumnPtStyles, DataTableWrapper } from "dashboard/common/data-table";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { LEAD_STATUS_OPTIONS, LEAD_TYPE_OPTIONS } from "common/constants/lead-options";
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import { LEADS_PAGE } from "common/constants/links";
import {
    formatCreatedDate,
    getLeadStatusPresentation,
    getLeadStatusToneModifier,
    getLeadTypeLabel,
} from "dashboard/leads/common";

interface TableColumnProps extends ColumnProps {
    field: keyof Deal;
}

type LeadsTableColumn = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

const renderColumnsData: LeadsTableColumn[] = [
    { field: "dealtype", header: "Type", checked: true },
    { field: "contactinfo", header: "Contact", checked: true },
    { field: "inventoryinfo", header: "Vehicle", checked: true },
    { field: "created", header: "Created", checked: true },
    { field: "status", header: "Status", checked: true },
];

interface LeadsFilterOptions {
    name: string;
    value: string;
}

interface LeadsFilterGroup {
    name: string;
    options: LeadsFilterOptions[];
}

enum FILTER_CATEGORIES {
    TYPE = "Type",
    STATUS = "Status",
}

const FILTER_GROUP_LIST: LeadsFilterGroup[] = [
    {
        name: FILTER_CATEGORIES.TYPE,
        options: LEAD_TYPE_OPTIONS.map(({ label, value }) => ({
            name: label,
            value: `${value}.type`,
        })),
    },
    {
        name: FILTER_CATEGORIES.STATUS,
        options: LEAD_STATUS_OPTIONS.map(({ label, value }) => ({
            name: label,
            value: `${value}.status`,
        })),
    },
];

enum SEARCH_FORM_FIELDS {
    CUSTOMER = "accountInfo",
    VIN = "VIN",
    STOCK_NO = "StockNo",
    DATE = "date",
}

interface AdvancedSearch {
    [key: string]: string | number;
    accountInfo: string;
    VIN: string;
    StockNo: string;
    date: string;
}

const LeadsColumnsHeader = ({
    columns,
    activeColumns,
    setActiveColumns,
    onCloseClick,
}: {
    columns: LeadsTableColumn[];
    activeColumns: LeadsTableColumn[];
    setActiveColumns: (columns: LeadsTableColumn[]) => void;
    onCloseClick?: (event: React.MouseEvent) => void;
}): ReactElement => {
    return (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    onChange={() => {
                        if (columns.length === activeColumns.length) {
                            setActiveColumns(columns.filter(({ checked }) => checked));
                        } else {
                            setActiveColumns(columns);
                        }
                    }}
                    checked={columns.length === activeColumns.length}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                type='button'
                className='p-multiselect-close p-link'
                onClick={(e) => {
                    setActiveColumns([]);
                    onCloseClick?.(e);
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );
};

export const LeadsDataTable = observer(() => {
    const [rows, setRows] = useState<Deal[]>([]);
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [lazyState, setLazyState] = useState<DatatableQueries>({
        ...initialDataTableQueries,
        first: 0,
        rows: ROWS_PER_PAGE[0],
        page: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [dealSelectedGroup, setDealSelectedGroup] = useState<string[]>([]);
    const [advancedSearch, setAdvancedSearch] = useState<Record<string, string | number>>({});
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
    const {
        activeColumns,
        setActiveColumnsAndSave,
        serverSettings,
        saveColumnWidth,
        settingsLoaded,
    } = useUserProfileSettings<LeadsUserSettings, LeadsTableColumn>("leads", renderColumnsData);
    const { showError } = useToastMessage();
    const { createReport } = useCreateReport<Deal>();
    const navigate = useNavigate();

    const hasAdvancedSearch = useMemo(
        () => Object.values(advancedSearch).some((value) => String(value || "").trim().length > 0),
        [advancedSearch]
    );

    const searchFields = [
        {
            key: SEARCH_FORM_FIELDS.CUSTOMER,
            label: "Customer",
            value: String(advancedSearch?.[SEARCH_FORM_FIELDS.CUSTOMER] || ""),
            type: SEARCH_FIELD_TYPE.TEXT,
        },
        {
            key: SEARCH_FORM_FIELDS.VIN,
            label: "VIN",
            value: String(advancedSearch?.[SEARCH_FORM_FIELDS.VIN] || ""),
            type: SEARCH_FIELD_TYPE.TEXT,
        },
        {
            key: SEARCH_FORM_FIELDS.STOCK_NO,
            label: "Stock#",
            value: String(advancedSearch?.[SEARCH_FORM_FIELDS.STOCK_NO] || ""),
            type: SEARCH_FIELD_TYPE.TEXT,
        },
        {
            key: SEARCH_FORM_FIELDS.DATE,
            label: "Date",
            value: String(advancedSearch?.[SEARCH_FORM_FIELDS.DATE] || ""),
            type: SEARCH_FIELD_TYPE.DATE_RANGE,
        },
    ];

    useEffect(() => {
        if (!settingsLoaded) return;
        if (!serverSettings?.leads && activeColumns.length) {
            setActiveColumnsAndSave(activeColumns);
        }
    }, [settingsLoaded, serverSettings, activeColumns, setActiveColumnsAndSave]);

    const handleGetRows = async (params: QueryParams, total?: boolean) => {
        if (!authUser) return;

        setIsLoading(true);
        try {
            if (total) {
                const totalResponse = await getDealsList(authUser.useruid, {
                    ...params,
                    total: 1,
                });
                if (totalResponse && !Array.isArray(totalResponse)) {
                    const totalData = totalResponse as TotalDealsList;
                    setTotalRecords(totalData.total ?? 0);
                }
            }

            const response = await getDealsList(authUser.useruid, params);
            if (Array.isArray(response)) {
                setRows(response);
            } else {
                setRows([]);
            }
        } catch (error) {
            showError(String(error));
        } finally {
            setIsLoading(false);
        }
    };

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;
        await createReport({
            userId: authUser.useruid,
            items: rows,
            columns: activeColumns.map((activeColumn) => ({
                field: activeColumn.field as keyof Deal,
                header: String(activeColumn.header),
            })),
            print,
            name: "leads",
        });
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    useEffect(() => {
        if (!authUser) return;

        const params: QueryParams = {
            ...(lazyState.sortOrder === 1 && { type: "asc" }),
            ...(lazyState.sortOrder === -1 && { type: "desc" }),
            ...(lazyState.sortField && { column: lazyState.sortField }),
            skip: lazyState.first,
            top: lazyState.rows,
        };

        handleGetRows(params, true);
    }, [lazyState, authUser]);

    const matchesFilterToken = (deal: Deal, token: string): boolean => {
        const [valuePart, fieldPart] = token.split(".");
        if (!valuePart || !fieldPart) return true;

        if (fieldPart === `${FILTER_CATEGORIES.TYPE}.type`) {
            if (deal.dealtype == null) return false;
            const normalizedDealType = deal.dealtype <= 1 ? "trade-in" : "service";
            return normalizedDealType === valuePart;
        }

        if (fieldPart === `${FILTER_CATEGORIES.STATUS}.status`) {
            const { tone } = getLeadStatusPresentation(deal);
            if (!tone) return false;
            const modifier = getLeadStatusToneModifier(tone);
            return modifier === valuePart;
        }

        return true;
    };

    const rowsToDisplay = useMemo(() => {
        const normalizedSearch = globalSearch.trim().toLowerCase();
        const selectedFilters = dealSelectedGroup.filter((item) => Boolean(item));

        return rows.filter((deal) => {
            if (selectedFilters.length) {
                const isFilterMatched = selectedFilters.every((token) =>
                    matchesFilterToken(deal, token)
                );
                if (!isFilterMatched) return false;
            }

            if (normalizedSearch) {
                const searchableText = [
                    getLeadTypeLabel(deal.dealtype),
                    deal.contactinfo,
                    deal.inventoryinfo,
                    formatCreatedDate(String(deal.created || "")),
                    getLeadStatusPresentation(deal).label,
                ]
                    .join(" ")
                    .toLowerCase();

                if (!searchableText.includes(normalizedSearch)) {
                    return false;
                }
            }

            const customerValue = String(advancedSearch.accountInfo || "")
                .trim()
                .toLowerCase();
            if (
                customerValue &&
                !String(deal.contactinfo || "")
                    .toLowerCase()
                    .includes(customerValue)
            ) {
                return false;
            }

            const vinValue = String(advancedSearch.VIN || "")
                .trim()
                .toLowerCase();
            if (
                vinValue &&
                !String(deal.inventoryinfo || "")
                    .toLowerCase()
                    .includes(vinValue)
            ) {
                return false;
            }

            const stockValue = String(advancedSearch.StockNo || "")
                .trim()
                .toLowerCase();
            if (
                stockValue &&
                !String(deal.inventoryinfo || "")
                    .toLowerCase()
                    .includes(stockValue)
            ) {
                return false;
            }

            const dateValue = String(advancedSearch.date || "").trim();
            if (dateValue) {
                const createdTime = new Date(deal.created).getTime();
                if (!Number.isNaN(createdTime)) {
                    if (dateValue.includes("-")) {
                        const [startDate, endDate] = dateValue.split("-");
                        const startTime = new Date(startDate).getTime();
                        const endTime = new Date(endDate).getTime();
                        if (
                            !Number.isNaN(startTime) &&
                            !Number.isNaN(endTime) &&
                            (createdTime < startTime || createdTime > endTime)
                        ) {
                            return false;
                        }
                    } else {
                        const selectedDate = new Date(dateValue).getTime();
                        if (!Number.isNaN(selectedDate)) {
                            const createdDate = new Date(createdTime).toDateString();
                            const selectedDateOnly = new Date(selectedDate).toDateString();
                            if (createdDate !== selectedDateOnly) {
                                return false;
                            }
                        }
                    }
                }
            }

            return true;
        });
    }, [rows, globalSearch, dealSelectedGroup, advancedSearch]);

    const hasLocalFilters = Boolean(
        globalSearch.trim() || dealSelectedGroup.length || hasAdvancedSearch
    );

    const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string | number) => {
        setAdvancedSearch((prevSearch) => {
            const newSearch = { ...prevSearch, [key]: value };
            const isEmpty = Object.values(newSearch).every((v) => String(v || "").trim() === "");
            setButtonDisabled(isEmpty);
            return newSearch;
        });
    };

    const handleAdvancedSearch = () => {
        setDialogVisible(false);
    };

    const handleClearAdvancedSearchField = (key: keyof AdvancedSearch) => {
        setAdvancedSearch((prev) => {
            const updatedSearch = { ...prev };
            delete updatedSearch[key];
            const isEmpty = Object.values(updatedSearch).every(
                (value) => String(value || "").trim() === ""
            );
            setButtonDisabled(isEmpty);
            return updatedSearch;
        });
    };

    const filterHeaderTemplate = ({ onCloseClick }: MultiSelectPanelHeaderTemplateEvent) => {
        const filterOptions = FILTER_GROUP_LIST.flatMap((group) =>
            group.options.map((option) => option.value)
        );
        const allSelected =
            filterOptions.length > 0 &&
            filterOptions.every((value) => dealSelectedGroup.includes(value));

        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        checked={allSelected}
                        onChange={() => {
                            setDealSelectedGroup(allSelected ? [] : filterOptions);
                        }}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    type='button'
                    className='p-multiselect-close p-link'
                    onClick={(event) => {
                        setDealSelectedGroup([]);
                        onCloseClick(event);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

    const filterTemplate = (
        <span className='p-float-label'>
            <MultiSelect
                optionValue='value'
                optionLabel='name'
                value={dealSelectedGroup}
                options={FILTER_GROUP_LIST}
                optionGroupLabel='name'
                optionGroupChildren='options'
                panelHeaderTemplate={filterHeaderTemplate}
                display='chip'
                className='leads__filter'
                onChange={(e) => {
                    e.stopPropagation();
                    setDealSelectedGroup(Array.isArray(e.value) ? [...e.value] : []);
                }}
                pt={{
                    wrapper: {
                        style: {
                            width: "230px",
                            maxHeight: "625px",
                        },
                    },
                }}
            />
            <label className='float-label'>Filter</label>
        </span>
    );

    const extraSelectedColumnsCount = Math.max(activeColumns.length - 1, 0);

    const columnsTemplate = (
        <ChipMultiSelect
            floatLabel={false}
            label='Columns'
            floatClassName='leads__columns-float'
            overflowCount={extraSelectedColumnsCount}
            value={activeColumns}
            options={renderColumnsData}
            optionLabel='header'
            maxSelectedLabels={1}
            selectedItemsLabel=''
            panelHeaderTemplate={() => (
                <LeadsColumnsHeader
                    columns={renderColumnsData}
                    activeColumns={activeColumns}
                    setActiveColumns={setActiveColumnsAndSave}
                />
            )}
            onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                stopPropagation();
                const nextValue = Array.isArray(value) ? [...value] : [];
                const sortedValue = nextValue.sort((a: LeadsTableColumn, b: LeadsTableColumn) => {
                    const firstIndex = renderColumnsData.findIndex((col) => col.field === a.field);
                    const secondIndex = renderColumnsData.findIndex((col) => col.field === b.field);
                    return firstIndex - secondIndex;
                });

                setActiveColumnsAndSave(sortedValue);
            }}
            pt={{
                header: {
                    className: "deals__columns-header",
                },
                label: {
                    className: "leads__columns-label",
                },
                wrapper: {
                    className: "deals__columns-wrapper",
                    style: {
                        width: "230px",
                        maxHeight: "500px",
                    },
                },
            }}
        />
    );

    return (
        <section className='card-content'>
            <div className='datatable-controls'>
                <GlobalSearchInput
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                />
                <Button
                    className='datatable-controls__search-button'
                    label='Advanced search'
                    severity='success'
                    type='button'
                    onClick={() => setDialogVisible(true)}
                />
                <ControlButton
                    variant={BUTTON_VARIANTS.NEW}
                    tooltip='Add new lead'
                    onClick={() => navigate(LEADS_PAGE.CREATE())}
                />
                <ControlButton
                    variant={BUTTON_VARIANTS.PRINT}
                    tooltip='Print leads list'
                    onClick={() => printTableData(true)}
                />
                <ControlButton
                    variant={BUTTON_VARIANTS.DOWNLOAD}
                    tooltip='Download leads list'
                    onClick={() => printTableData()}
                />
                {filterTemplate}
                {columnsTemplate}
            </div>
            {isLoading ? (
                <div className='dashboard-loader__wrapper'>
                    <Loader overlay />
                </div>
            ) : (
                <DataTable
                    showGridlines
                    value={rowsToDisplay}
                    lazy
                    paginator
                    scrollable
                    scrollHeight='auto'
                    first={lazyState.first}
                    rows={lazyState.rows}
                    rowsPerPageOptions={ROWS_PER_PAGE}
                    totalRecords={hasLocalFilters ? rowsToDisplay.length || 1 : totalRecords || 1}
                    onPage={pageChanged}
                    onSort={sortData}
                    reorderableColumns
                    resizableColumns
                    rowClassName={() => "table-row"}
                    onColumnResizeEnd={(event) => {
                        if (event?.column?.props?.field && event?.element?.offsetWidth) {
                            saveColumnWidth(
                                event.column.props.field as string,
                                event.element.offsetWidth
                            );
                        }
                    }}
                    emptyMessage={ERROR_MESSAGES.NO_DATA}
                >
                    <Column
                        bodyStyle={{ textAlign: "center" }}
                        reorderable={false}
                        resizeable={false}
                        body={(lead: Deal) => (
                            <Button
                                text
                                className='table-edit-button'
                                icon='adms-edit-item'
                                tooltip='Edit lead'
                                tooltipOptions={{ position: "mouse" }}
                                onClick={() =>
                                    navigate(LEADS_PAGE.EDIT(lead.dealuid), { state: { lead } })
                                }
                            />
                        )}
                        pt={{
                            root: {
                                style: {
                                    width: "40px",
                                    padding: "0px",
                                },
                            },
                        }}
                    />
                    {activeColumns.map(({ field, header }: LeadsTableColumn, index) => {
                        const savedWidth = serverSettings?.leads?.columnWidth?.[field];
                        const isLastColumn = index === activeColumns.length - 1;
                        const additionalStyles =
                            field === "status"
                                ? {
                                      maxWidth: "240px",
                                      width: "240px",
                                  }
                                : undefined;

                        return (
                            <Column
                                field={field}
                                header={header}
                                key={field}
                                sortable
                                headerClassName='cursor-move'
                                body={(data: Deal) => {
                                    if (field === "dealtype") {
                                        const text = getLeadTypeLabel(
                                            Number.isFinite(data.dealtype)
                                                ? data.dealtype
                                                : Number(data.dealtype)
                                        );
                                        return <TruncatedText text={text} withTooltip />;
                                    }
                                    if (field === "created") {
                                        const text = formatCreatedDate(String(data.created || ""));
                                        return <TruncatedText text={text} withTooltip />;
                                    }
                                    if (field === "status") {
                                        const { label, tone } = getLeadStatusPresentation(data);
                                        if (!tone) return "";
                                        const modifier = getLeadStatusToneModifier(tone);
                                        return (
                                            <span
                                                className={`leads__status-pill leads__status-pill--${modifier}`}
                                            >
                                                {label}
                                            </span>
                                        );
                                    }
                                    if (field === "inventoryinfo") {
                                        const text = String(data.inventoryinfo || "").toUpperCase();
                                        return <TruncatedText text={text} withTooltip />;
                                    }
                                    const value = String(data[field as keyof Deal] ?? "");
                                    return <TruncatedText text={value} withTooltip />;
                                }}
                                pt={getColumnPtStyles({
                                    savedWidth,
                                    isLastColumn,
                                    additionalStyles,
                                })}
                            />
                        );
                    })}
                </DataTable>
            )}
            <AdvancedSearchDialog<AdvancedSearch>
                visible={dialogVisible}
                buttonDisabled={buttonDisabled}
                className='leads-advanced-search'
                onHide={() => {
                    setButtonDisabled(!hasAdvancedSearch);
                    setDialogVisible(false);
                }}
                action={handleAdvancedSearch}
                onSearchClear={handleClearAdvancedSearchField}
                onInputChange={handleSetAdvancedSearch}
                fields={searchFields as SearchField<AdvancedSearch>[]}
                searchForm={SEARCH_FORM_TYPE.LEADS}
            />
        </section>
    );
});

export const Leads = () => {
    return (
        <DataTableWrapper className='card leads'>
            <div className='card-header'>
                <h2 className='card-header__title uppercase m-0'>Leads list</h2>
            </div>
            <LeadsDataTable />
        </DataTableWrapper>
    );
};
