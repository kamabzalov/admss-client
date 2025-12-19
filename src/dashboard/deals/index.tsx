import { useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { QueryParams } from "common/models/query-params";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { getDealsList, TotalDealsList } from "http/services/deals.service";
import { ROWS_PER_PAGE } from "common/settings";
import { useNavigate } from "react-router-dom";
import { Deal } from "common/models/deals";
import { Loader } from "dashboard/common/loader";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import {
    AdvancedSearchDialog,
    SEARCH_FORM_TYPE,
    SearchField,
    SEARCH_FIELD_TYPE,
} from "dashboard/common/dialog/search";
import { useStore } from "store/hooks";
import { createStringifySearchQuery, isObjectValuesEmpty } from "common/helpers";
import { observer } from "mobx-react-lite";
import "./index.css";
import { DropdownHeaderPanel } from "dashboard/deals/common";
import { BUTTON_VARIANTS, ControlButton } from "dashboard/common/button";
import { DEALS_PAGE } from "common/constants/links";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { TruncatedText } from "dashboard/common/display";
import { useCreateReport, useToastMessage } from "common/hooks";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { DealsUserSettings } from "common/models/user";
import { getColumnPtStyles, DataTableWrapper } from "dashboard/common/data-table";

interface TableColumnProps extends ColumnProps {
    field: keyof Deal | "";
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

const renderColumnsData: TableColumnsList[] = [
    { field: "accountInfo", header: "Account", checked: true },
    { field: "contactinfo", header: "Customer", checked: true },
    { field: "dealtype", header: "Type", checked: true },
    { field: "dateeffective", header: "Sale Date", checked: true },
    { field: "inventoryinfo", header: "Info (Vehicle)", checked: true },
];

interface DealsFilterOptions {
    name: string;
    value: string;
}

interface DealsFilterGroup {
    name: string;
    options: DealsFilterOptions[];
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

const DEALS_TYPE_LIST: DealsFilterOptions[] = [
    { name: "All", value: "allTypes" },
    { name: "Buy Here Pay Here", value: "0.DealType" },
    { name: "Lease Here Pay Here", value: "7.DealType" },
    { name: "Cash", value: "1.DealType" },
    { name: "Wholesale", value: "5.DealType" },
    { name: "Dismantled", value: "6.DealType" },
];

const DEALS_OTHER_LIST: DealsFilterOptions[] = [
    { name: "All incomplete", value: "0.DealComplete" },
    { name: "Dead or Deleted", value: `${DEAL_STATUS_ID.DEAD_OR_DELETED}.DealStatus` },
    { name: "Deals not yet sent to RFC", value: "0.RFCSent" },
];

const DEALS_STATUS_LIST: DealsFilterOptions[] = [
    { name: "All", value: "allStatuses" },
    { name: "Recent deals", value: "0.30.Age" },
    { name: "Quotes", value: `${DEAL_STATUS_ID.QUOTE_OR_PROSPECT}.DealStatus` },
    { name: "Pending", value: `${DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT}.DealStatus` },
    { name: "Sold, Not finalized", value: `${DEAL_STATUS_ID.SOLD_NOT_FINALIZED}.DealStatus` },
    { name: "Manager's review", value: "1.managerReview" },
];

const FILTER_GROUP_LIST: DealsFilterGroup[] = [
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

const getDealStatusIcon = (dealStatusId: number): string => {
    const currentIcon = (color: string) => `pi pi-circle-fill pi-circle--${color}`;
    const infoIcon = "adms-info";
    switch (dealStatusId) {
        case DEAL_STATUS_ID.QUOTE_OR_PROSPECT:
            return infoIcon;
        case DEAL_STATUS_ID.PENDING_OR_IN_TRANSIT:
            return currentIcon("red");
        case DEAL_STATUS_ID.SOLD_NOT_FINALIZED:
            return currentIcon("orange");
        case DEAL_STATUS_ID.SOLD_FINALIZED:
            return currentIcon("green");
        default:
            return currentIcon("grey");
    }
};

enum SEARCH_FORM_FIELDS {
    CUSTOMER = "accountInfo",
    VIN = "VIN",
    STOCK_NO = "StockNo",
    DATE = "date",
}

enum SEARCH_FORM_QUERY {
    CUSTOMER = "contactinfo",
    VIN = "inventoryinfo",
    STOCK_NO = "inventoryinfo",
    DATE = "dateeffective",
}

interface AdvancedSearch {
    [key: string]: string | number;
    accountInfo: string;
    VIN: string;
    StockNo: string;
    date: string;
}

interface DealsDataTableProps {
    onRowClick?: (dealName: string) => void;
    originalPath?: string;
    returnedField?: keyof Deal;
    getFullInfo?: (deal: Deal) => void;
}

export const DealsDataTable = observer(
    ({ onRowClick, originalPath, returnedField, getFullInfo }: DealsDataTableProps) => {
        const [deals, setDeals] = useState<Deal[]>([]);
        const store = useStore().dealStore;
        const { clearDeal } = store;
        const userStore = useStore().userStore;
        const { authUser } = userStore;
        const [totalRecords, setTotalRecords] = useState<number>(0);
        const [globalSearch, setGlobalSearch] = useState<string>("");
        const [lazyState, setLazyState] = useState<DatatableQueries>({
            ...initialDataTableQueries,
            first: 0,
            rows: ROWS_PER_PAGE[0],
            page: 0,
        });
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [dealSelectedGroup, setDealSelectedGroup] = useState<string[]>([]);
        const [advancedSearch, setAdvancedSearch] = useState<Record<string, string | number>>({});
        const [dialogVisible, setDialogVisible] = useState<boolean>(false);
        const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
        const { activeColumns, setActiveColumnsAndSave, serverSettings, saveColumnWidth } =
            useUserProfileSettings<DealsUserSettings, TableColumnsList>("deals", renderColumnsData);
        const navigate = useNavigate();
        const { showError } = useToastMessage();
        const { createReport } = useCreateReport<Deal>();

        const searchFields = [
            {
                key: SEARCH_FORM_FIELDS.CUSTOMER,
                label: "Customer",
                value: advancedSearch?.[SEARCH_FORM_FIELDS.CUSTOMER],
                type: SEARCH_FIELD_TYPE.TEXT,
            },
            {
                key: SEARCH_FORM_FIELDS.VIN,
                label: "VIN",
                value: advancedSearch?.[SEARCH_FORM_FIELDS.VIN],
                type: SEARCH_FIELD_TYPE.TEXT,
            },
            {
                key: SEARCH_FORM_FIELDS.STOCK_NO,
                label: "Stock#",
                value: advancedSearch?.[SEARCH_FORM_FIELDS.STOCK_NO],
                type: SEARCH_FIELD_TYPE.TEXT,
            },
            {
                key: SEARCH_FORM_FIELDS.DATE,
                label: "Date",
                value: advancedSearch?.[SEARCH_FORM_FIELDS.DATE],
                type: SEARCH_FIELD_TYPE.DATE_RANGE,
            },
        ];

        const handleGetDeals = async (params: QueryParams, total?: boolean) => {
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
                    setDeals(response);
                } else {
                    setDeals([]);
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
                items: deals,
                columns: activeColumns.map((activeColumn) => ({
                    field: activeColumn.field as keyof Deal,
                    header: String(activeColumn.header),
                })),
                print,
                name: "deals",
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

            let qry: string = "";
            const selectedFilters: string = [...dealSelectedGroup]
                .filter((item) => item && item !== "allTypes" && item !== "allStatuses")
                .join("+");
            if (selectedFilters.length) {
                qry += selectedFilters;
            }
            if (globalSearch) {
                if (qry.length) qry += "+";
                qry += globalSearch;
            }
            if (qry.length) {
                params.qry = qry;
            }

            handleGetDeals(params, true);
        }, [lazyState, authUser, globalSearch, dealSelectedGroup]);

        const handleSetAdvancedSearch = (key: keyof AdvancedSearch, value: string | number) => {
            setAdvancedSearch((prevSearch) => {
                const newSearch = { ...prevSearch, [key]: value };
                const isAnyValueEmpty = Object.values(newSearch).every((v) => v === "");
                setButtonDisabled(isAnyValueEmpty);
                return newSearch;
            });
        };

        const handleAdvancedSearch = () => {
            const searchQuery = Object.entries(advancedSearch)
                .filter(([_, value]) => value)
                .map(([key, value]) => {
                    let keyName: string = key;
                    switch (key) {
                        case SEARCH_FORM_FIELDS.CUSTOMER:
                            keyName = SEARCH_FORM_QUERY.CUSTOMER;
                            break;
                        case SEARCH_FORM_FIELDS.VIN:
                            keyName = SEARCH_FORM_QUERY.VIN;
                            break;
                        case SEARCH_FORM_FIELDS.STOCK_NO:
                            keyName = SEARCH_FORM_QUERY.STOCK_NO;
                            break;
                        case SEARCH_FORM_FIELDS.DATE:
                            keyName = SEARCH_FORM_QUERY.DATE;
                            if (typeof value === "string" && value.includes("-")) {
                                const [startDate, endDate] = value.split("-");
                                return `${startDate}.${endDate}.${keyName}`;
                            }
                            value = new Date(value).getTime();
                            break;
                    }
                    return `${value}.${keyName}`;
                })
                .join("+");

            const params: QueryParams = {
                skip: lazyState.first,
                top: lazyState.rows,
                qry: searchQuery,
            };
            handleGetDeals(params);

            setDialogVisible(false);
        };

        const handleOnRowClick = ({ data }: DataTableRowClickEvent): void => {
            const selectedText = window.getSelection()?.toString();

            if (!!selectedText?.length) {
                return;
            }
            if (getFullInfo) {
                getFullInfo(data as Deal);
            }
            if (onRowClick) {
                const value = returnedField ? data[returnedField] : data.contactinfo;
                onRowClick(value);
            } else {
                navigate(data.dealuid);
            }
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

                const isAdvancedSearchEmpty = isObjectValuesEmpty(advancedSearch);
                const params: QueryParams = {
                    ...(lazyState.sortOrder === 1 && { type: "asc" }),
                    ...(lazyState.sortOrder === -1 && { type: "desc" }),
                    ...(!isAdvancedSearchEmpty && {
                        qry: createStringifySearchQuery(updatedSearch),
                    }),
                    skip: lazyState.first,
                    top: lazyState.rows,
                };
                await handleGetDeals(params);
            } finally {
                setButtonDisabled(false);
            }
        };

        const handleCreateDeal = () => {
            clearDeal();
            if (originalPath) {
                store.memoRoute = originalPath;
            }
            navigate(DEALS_PAGE.CREATE());
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
                    className='deals__filter'
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
                                return (
                                    itemCategory !== lastSelectedCategory || item === lastSelected
                                );
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

        const columnsTemplate = (
            <span className='p-float-label'>
                <MultiSelect
                    value={activeColumns}
                    options={renderColumnsData}
                    optionLabel='header'
                    className='deals__columns'
                    display='chip'
                    panelHeaderTemplate={() => (
                        <DropdownHeaderPanel
                            columns={renderColumnsData}
                            activeColumns={activeColumns}
                            setActiveColumns={setActiveColumnsAndSave}
                        />
                    )}
                    onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                        stopPropagation();
                        const sortedValue = value.sort(
                            (a: TableColumnsList, b: TableColumnsList) => {
                                const firstIndex = renderColumnsData.findIndex(
                                    (col) => col.field === a.field
                                );
                                const secondIndex = renderColumnsData.findIndex(
                                    (col) => col.field === b.field
                                );
                                return firstIndex - secondIndex;
                            }
                        );

                        setActiveColumnsAndSave(sortedValue);
                    }}
                    pt={{
                        header: {
                            className: "deals__columns-header",
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
                <label className='float-label'>Columns</label>
            </span>
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
                        tooltip='Add new deal'
                        onClick={handleCreateDeal}
                    />
                    <ControlButton
                        variant={BUTTON_VARIANTS.PRINT}
                        tooltip='Print deals form'
                        onClick={() => printTableData(true)}
                    />
                    <ControlButton
                        variant={BUTTON_VARIANTS.DOWNLOAD}
                        tooltip='Download deals form'
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
                        value={deals}
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
                        reorderableColumns
                        resizableColumns
                        rowClassName={() => "table-row"}
                        onRowClick={handleOnRowClick}
                        onColumnResizeEnd={(event) => {
                            if (event?.column?.props?.field && event?.element?.offsetWidth) {
                                saveColumnWidth(
                                    event.column.props.field as string,
                                    event.element.offsetWidth
                                );
                            }
                        }}
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            reorderable={false}
                            resizeable={false}
                            body={(rowDeal: Deal) => {
                                const statusIcon = getDealStatusIcon(rowDeal.dealstatus);
                                const statusLabel = getDealStatusLabel(rowDeal.dealstatus);
                                return (
                                    <div className={`flex gap-3 align-items-center`}>
                                        <Button
                                            text
                                            className='table-edit-button'
                                            icon='adms-edit-item'
                                            tooltip='Edit deal'
                                            tooltipOptions={{ position: "mouse" }}
                                            onClick={() =>
                                                navigate(DEALS_PAGE.EDIT(rowDeal.dealuid))
                                            }
                                        />
                                        <Button
                                            icon={statusIcon}
                                            className='deals__status-icon'
                                            text
                                            tooltip={statusLabel}
                                            tooltipOptions={{ position: "mouse" }}
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
                        {activeColumns.map(({ field, header }: TableColumnsList, index) => {
                            const savedWidth = serverSettings?.deals?.columnWidth?.[field];
                            const isLastColumn = index === activeColumns.length - 1;

                            return (
                                <Column
                                    field={field}
                                    header={header}
                                    key={field}
                                    sortable
                                    headerClassName='cursor-move'
                                    body={(data) => {
                                        const value = String(data[field] || "");
                                        return <TruncatedText text={value} withTooltip />;
                                    }}
                                    pt={getColumnPtStyles({ savedWidth, isLastColumn })}
                                />
                            );
                        })}
                    </DataTable>
                )}
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
                    fields={searchFields as SearchField<AdvancedSearch>[]}
                    searchForm={SEARCH_FORM_TYPE.DEALS}
                />
            </section>
        );
    }
);

export const Deals = () => {
    return (
        <DataTableWrapper className='card deals'>
            <div className='card-header'>
                <h2 className='card-header__title uppercase m-0'>Deals</h2>
            </div>
            <DealsDataTable />
        </DataTableWrapper>
    );
};
