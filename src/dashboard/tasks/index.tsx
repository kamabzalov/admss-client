import { ReactElement, useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";

import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
} from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnProps } from "primereact/column";
import { QueryParams } from "common/models/query-params";
import { ROWS_PER_PAGE } from "common/settings";
import { makeShortReports } from "http/services/reports.service";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { ReportsColumn } from "common/models/reports";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import {
    AdvancedSearchDialog,
    SEARCH_FORM_TYPE,
    SearchField,
} from "dashboard/common/dialog/search";
import { useStore } from "store/hooks";
import { Task } from "common/models/tasks";
import { getTasksByUserId } from "http/services/tasks.service";
import { useToast } from "dashboard/common/toast";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "useruid", header: "Assigned To" },
    { field: "startdate", header: "Start Date" },
    { field: "deadline", header: "Due Date" },
    { field: "phone", header: "Phone number" },
    { field: "accountuid", header: "Account" },
    { field: "dealuid", header: "Deal" },
    { field: "contactuid", header: "Contact" },
];

enum SEARCH_FORM_FIELDS {
    CREATION_DATE = "Creation Date",
    DESCRIPTION = "Description",
}

enum SEARCH_FORM_QUERY {
    CREATION_DATE = "date",
    DESCRIPTION = "description",
}

interface AdvancedSearch {
    [key: string]: string | number;
    info: string;
    date: string;
}

interface TasksDataTableProps {
    onRowClick?: (accountName: string) => void;
    returnedField?: keyof Task;
    getFullInfo?: (account: Task) => void;
}

export const TasksDataTable = observer(
    ({ onRowClick, returnedField, getFullInfo }: TasksDataTableProps): ReactElement => {
        const toast = useToast();
        const userStore = useStore().userStore;
        const [tasks, setTasks] = useState<Task[]>([]);
        const { authUser } = userStore;
        const [totalRecords, setTotalRecords] = useState<number>(0);
        const [globalSearch, setGlobalSearch] = useState<string>("");
        const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
        const [advancedSearch, setAdvancedSearch] = useState<Record<string, string | number>>({});
        const [dialogVisible, setDialogVisible] = useState<boolean>(false);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);
        const navigate = useNavigate();

        const handleGetTasks = async (params?: QueryParams) => {
            const responseTotal = await getTasksByUserId(authUser!.useruid, { total: 1 });
            const response = await getTasksByUserId(authUser!.useruid, params);

            if (responseTotal.error || response.error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: responseTotal.error || response.error,
                });
            }
            if (responseTotal && !Array.isArray(responseTotal)) {
                const { total } = responseTotal;
                setTotalRecords(total ?? 0);
            }
            if (response && !Array.isArray(response)) {
                setTasks(response);
            }
        };

        useEffect(() => {
            handleGetTasks();
        }, []);

        const searchFields = [
            {
                key: SEARCH_FORM_FIELDS.CREATION_DATE,
                label: SEARCH_FORM_FIELDS.CREATION_DATE,
                value: advancedSearch?.[SEARCH_FORM_FIELDS.CREATION_DATE],
                type: "date",
            },

            {
                key: SEARCH_FORM_FIELDS.DESCRIPTION,
                label: SEARCH_FORM_FIELDS.DESCRIPTION,
                value: advancedSearch?.[SEARCH_FORM_FIELDS.DESCRIPTION],
                type: "text",
            },
        ];

        const printTableData = async (print: boolean = false) => {
            setIsLoading(true);
            const columns: ReportsColumn[] = renderColumnsData.map((column) => ({
                name: column.header as string,
                data: column.field as string,
            }));
            const date = new Date();
            const name = `tasks_${
                date.getMonth() + 1
            }-${date.getDate()}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}`;

            if (authUser) {
                const data = tasks.map((item) => {
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
            setIsLoading(false);
        };

        const pageChanged = (event: DataTablePageEvent) => {
            setLazyState(event);
        };

        const sortData = (event: DataTableSortEvent) => {
            setLazyState(event);
        };

        useEffect(() => {
            const params: QueryParams = {
                ...(globalSearch && { qry: globalSearch }),
                ...(lazyState.sortField && { column: lazyState.sortField }),
                skip: lazyState.first,
                top: lazyState.rows,
            };
            if (authUser) {
                handleGetTasks(params);
            }
        }, [lazyState, authUser, globalSearch]);

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
                        case SEARCH_FORM_FIELDS.CREATION_DATE:
                            keyName = SEARCH_FORM_QUERY.CREATION_DATE;
                            break;

                        case SEARCH_FORM_FIELDS.DESCRIPTION:
                            keyName = SEARCH_FORM_QUERY.DESCRIPTION;
                            value = new Date(value).getTime();
                            break;
                    }
                    return `${value}.${keyName}`;
                })
                .join("+");

            const params: QueryParams = {
                top: lazyState.first,
                skip: lazyState.skip,
                qry: searchQuery,
            };
            authUser && handleGetTasks(params);

            setDialogVisible(false);
        };

        const handleOnRowClick = ({ data }: DataTableRowClickEvent) => {
            if (getFullInfo) {
                getFullInfo(data as Task);
            }
            if (onRowClick) {
                const value = returnedField ? data[returnedField] : data.name;
                onRowClick(value);
            } else {
                navigate(data.accountuid);
            }
        };

        const handleClearAdvancedSearchField = (key: keyof AdvancedSearch) => {
            setAdvancedSearch((prevSearch) => {
                const updatedSearch = { ...prevSearch };
                delete updatedSearch[key];
                return updatedSearch;
            });
        };

        return (
            <div className='card-content'>
                <div className='grid datatable-controls'>
                    <div className='col-6'>
                        <div className='contact-top-controls'>
                            <Button
                                severity='success'
                                type='button'
                                icon='icon adms-print'
                                tooltip='Print tasks form'
                                onClick={() => printTableData(true)}
                            />
                            <Button
                                severity='success'
                                type='button'
                                icon='icon adms-blank'
                                tooltip='Download tasks form'
                                onClick={() => printTableData()}
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
                            <i className='pi pi-search' />
                            <InputText
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                        </span>
                    </div>
                </div>
                <div className='grid'>
                    <div className='col-12'>
                        {isLoading ? (
                            <div className='dashboard-loader__wrapper'>
                                <Loader overlay />
                            </div>
                        ) : (
                            <DataTable
                                showGridlines
                                value={tasks}
                                lazy
                                paginator
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
                                rowClassName={() => "hover:text-primary cursor-pointer"}
                                onRowClick={handleOnRowClick}
                            >
                                {renderColumnsData.map(({ field, header }) => (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        headerClassName='cursor-move'
                                    />
                                ))}
                            </DataTable>
                        )}
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
                    fields={searchFields as SearchField<AdvancedSearch>[]}
                    searchForm={SEARCH_FORM_TYPE.ACCOUNTS}
                />
            </div>
        );
    }
);

export const Tasks = (): ReactElement => {
    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Tasks</h2>
                    </div>
                    <TasksDataTable />
                </div>
            </div>
        </div>
    );
};
