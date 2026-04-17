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
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
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
import { Checkbox } from "primereact/checkbox";
import { useNavigate } from "react-router-dom";
import { DEALS_PAGE } from "common/constants/links";

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
    TYPE = "Type (one of the list)",
    STATUS = "Status (one of the list)",
    OTHER = "Other",
}

enum DEAL_STATUS_ID {
    QUOTE_OR_PROSPECT = 0,
    PENDING_OR_IN_TRANSIT = 1,
    SOLD_NOT_FINALIZED = 2,
    SOLD_FINALIZED = 3,
    DEAD_OR_DELETED = 6,
}

const DEALS_TYPE_LIST: LeadsFilterOptions[] = [
    { name: "All", value: "allTypes" },
    { name: "Buy Here Pay Here", value: "0.DealType" },
    { name: "Lease Here Pay Here", value: "7.DealType" },
    { name: "Cash", value: "1.DealType" },
    { name: "Wholesale", value: "5.DealType" },
    { name: "Dismantled", value: "6.DealType" },
];

const DEALS_OTHER_LIST: LeadsFilterOptions[] = [
    { name: "All incomplete", value: "0.DealComplete" },
    { name: "Dead or Deleted", value: `${DEAL_STATUS_ID.DEAD_OR_DELETED}.DealStatus` },
    { name: "Deals not yet sent to RFC", value: "0.RFCSent" },
];

const DEALS_STATUS_LIST: LeadsFilterOptions[] = [
    { name: "All", value: "allStatuses" },
    { name: "Recent deals", value: "0.30.Age" },
    { name: "Quotes", value: `${DEAL_STATUS_ID.QUOTE_OR_PROSPECT}.DealStatus` },
    { name: "Pending", value: `${DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT}.DealStatus` },
    { name: "Sold, Not finalized", value: `${DEAL_STATUS_ID.SOLD_NOT_FINALIZED}.DealStatus` },
    { name: "Manager's review", value: "1.managerReview" },
];

const FILTER_GROUP_LIST: LeadsFilterGroup[] = [
    { name: FILTER_CATEGORIES.TYPE, options: DEALS_TYPE_LIST },
    { name: FILTER_CATEGORIES.STATUS, options: DEALS_STATUS_LIST },
    { name: FILTER_CATEGORIES.OTHER, options: DEALS_OTHER_LIST },
];

const getDealStatusLabel = (dealStatusId: number): string => {
    switch (dealStatusId) {
        case DEAL_STATUS_ID.QUOTE_OR_PROSPECT:
            return "Quote";
        case DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT:
            return "Pending";
        case DEAL_STATUS_ID.SOLD_NOT_FINALIZED:
            return "Not finalized deals";
        case DEAL_STATUS_ID.SOLD_FINALIZED:
            return "Finalized deals";
        default:
            return "Unknown";
    }
};

const LEAD_STATUS_LABEL = {
    new: "NEW",
    inProgress: "IN PROGRESS",
    completed: "COMPLETED",
    rejected: "REJECTED",
} as const;

type LeadStatusTone = keyof typeof LEAD_STATUS_LABEL | "neutral";

const normalizeStatusText = (raw: string): string => raw.trim().toUpperCase().replace(/\s+/g, " ");

const classifyLeadStatusFromText = (normalized: string): LeadStatusTone | null => {
    if (!normalized) return null;
    if (
        normalized.includes("REJECT") ||
        normalized.includes("DEAD") ||
        normalized.includes("DELETE") ||
        normalized.includes("CANCEL")
    ) {
        return "rejected";
    }
    if (
        normalized.includes("COMPLET") ||
        normalized.includes("FINALIZED") ||
        (normalized.includes("FINAL") && !normalized.includes("NOT FINAL"))
    ) {
        return "completed";
    }
    if (
        normalized.includes("IN PROGRESS") ||
        normalized.includes("PROGRESS") ||
        normalized.includes("PENDING") ||
        normalized.includes("PEND") ||
        normalized.includes("NOT FINAL") ||
        normalized.includes("IN TRANSIT")
    ) {
        return "inProgress";
    }
    if (normalized.includes("NEW") || normalized.includes("QUOTE")) {
        return "new";
    }
    return null;
};

const classifyLeadStatusFromDealStatus = (dealStatusId: number): LeadStatusTone | null => {
    switch (dealStatusId) {
        case DEAL_STATUS_ID.DEAD_OR_DELETED:
            return "rejected";
        case DEAL_STATUS_ID.SOLD_FINALIZED:
            return "completed";
        case DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT:
        case DEAL_STATUS_ID.SOLD_NOT_FINALIZED:
            return "inProgress";
        case DEAL_STATUS_ID.QUOTE_OR_PROSPECT:
            return "new";
        default:
            return null;
    }
};

const getLeadStatusPresentation = (deal: Deal): { label: string; pillClass: string } => {
    const fromApi = deal.status?.trim();
    const normalizedApi = fromApi ? normalizeStatusText(fromApi) : "";
    const fromText = normalizedApi ? classifyLeadStatusFromText(normalizedApi) : null;
    const fromId = classifyLeadStatusFromDealStatus(deal.dealstatus);
    const tone: LeadStatusTone = fromText ?? fromId ?? "neutral";

    if (tone === "neutral") {
        const label = normalizedApi || getDealStatusLabel(deal.dealstatus).toUpperCase();
        return {
            label,
            pillClass: "leads__status-pill leads__status-pill--neutral",
        };
    }

    return {
        label: LEAD_STATUS_LABEL[tone],
        pillClass: `leads__status-pill leads__status-pill--${tone === "inProgress" ? "in-progress" : tone}`,
    };
};

const getLeadTypeLabel = (dealtype: number | null | undefined): string => {
    if (dealtype == null) return "";
    return dealtype <= 1 ? "Trade-in" : "Service";
};

const formatCreatedDate = (value: string): string => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return parsed.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    });
};

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
        const parsedValue = Number(valuePart);
        if (!Number.isFinite(parsedValue) || !fieldPart) return true;

        if (fieldPart === "DealType") {
            return Number(deal.dealtype) === parsedValue;
        }
        if (fieldPart === "DealStatus") {
            return Number(deal.dealstatus) === parsedValue;
        }
        return true;
    };

    const rowsToDisplay = useMemo(() => {
        const normalizedSearch = globalSearch.trim().toLowerCase();
        const selectedFilters = dealSelectedGroup.filter(
            (item) => item && item !== "allTypes" && item !== "allStatuses"
        );

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

    const filterTemplate = (
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
                className='leads__filter'
                onChange={(e) => {
                    e.stopPropagation();
                    const newValue = [...e.value];
                    const lastSelected = newValue[newValue.length - 1];

                    const lastSelectedCategory = FILTER_GROUP_LIST.find((group) =>
                        group.options.some((option) => option.value === lastSelected)
                    )?.name;

                    if (
                        lastSelectedCategory === FILTER_CATEGORIES.TYPE ||
                        lastSelectedCategory === FILTER_CATEGORIES.STATUS
                    ) {
                        const filteredValue = newValue.filter((item) => {
                            const itemCategory = FILTER_GROUP_LIST.find((group) =>
                                group.options.some((option) => option.value === item)
                            )?.name;
                            return itemCategory !== lastSelectedCategory || item === lastSelected;
                        });
                        setDealSelectedGroup(filteredValue);
                    } else {
                        setDealSelectedGroup(newValue);
                    }
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
                    onClick={() => navigate(DEALS_PAGE.CREATE())}
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
                                        const { label, pillClass } =
                                            getLeadStatusPresentation(data);
                                        return <span className={pillClass}>{label}</span>;
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
                onHide={() => {
                    setButtonDisabled(!hasAdvancedSearch);
                    setDialogVisible(false);
                }}
                action={handleAdvancedSearch}
                onSearchClear={handleClearAdvancedSearchField}
                onInputChange={handleSetAdvancedSearch}
                fields={searchFields as SearchField<AdvancedSearch>[]}
                searchForm={SEARCH_FORM_TYPE.DEALS}
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
