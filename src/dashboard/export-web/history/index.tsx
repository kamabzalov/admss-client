import { ReactElement, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import { store } from "store";
import { getExportHistoryList } from "http/services/export-to-web.service";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { ExportWebHistoryList } from "common/models/export-web";
import { QueryParams } from "common/models/query-params";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";

interface HistoryColumnProps extends ColumnProps {
    field: keyof ExportWebHistoryList;
}

type HistoryColumnsList = Pick<HistoryColumnProps, "header" | "field"> & { checked: boolean };

const historyColumns: HistoryColumnsList[] = [
    { field: "id", header: "#", checked: true },
    { field: "taskstatus", header: "Status", checked: true },
    { field: "created", header: "Created", checked: true },
    { field: "tasktype", header: "Type", checked: true },
    { field: "info", header: "Info", checked: true },
];

export const ExportHistory = (): ReactElement => {
    const userStore = store.userStore;
    const { authUser } = userStore;
    const [historyList, setHistoryList] = useState<ExportWebHistoryList[]>([]);
    const [activeHistoryColumns, setActiveHistoryColumns] =
        useState<HistoryColumnsList[]>(historyColumns);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    const handleGetExportHistoryList = async (params: QueryParams, total?: boolean) => {
        if (authUser) {
            if (total) {
                getExportHistoryList(authUser.useruid, { ...params, total: 1 }).then((response) => {
                    if (response && !Array.isArray(response)) {
                        setTotalRecords(response.total ?? 0);
                    }
                });
            }
            getExportHistoryList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setHistoryList(response);
                } else {
                    setHistoryList([]);
                }
            });
        }
    };

    useEffect(() => {
        if (authUser) {
            handleGetExportHistoryList(lazyState, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, lazyState]);

    const dropdownHeaderPanel = (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    checked={historyColumns.length === activeHistoryColumns.length}
                    onChange={() => {
                        setActiveHistoryColumns(historyColumns);
                    }}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={() => {
                    return setActiveHistoryColumns(historyColumns.filter(({ checked }) => checked));
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );

    return (
        <div className='card-content history'>
            <div className='grid datatable-controls'>
                <div className='col-12 export-web-controls'>
                    <div className='export-web-controls__input'>
                        <MultiSelect
                            showSelectAll={false}
                            value={activeHistoryColumns}
                            optionLabel='header'
                            options={historyColumns}
                            onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                                stopPropagation();
                                const sortedValue = value.sort(
                                    (a: HistoryColumnsList, b: HistoryColumnsList) => {
                                        const firstIndex = historyColumns.findIndex(
                                            (col) => col.field === a.field
                                        );
                                        const secondIndex = historyColumns.findIndex(
                                            (col) => col.field === b.field
                                        );
                                        return firstIndex - secondIndex;
                                    }
                                );

                                setActiveHistoryColumns(sortedValue);
                            }}
                            className='w-full pb-0 h-full flex align-items-center column-picker'
                            panelHeaderTemplate={dropdownHeaderPanel}
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
                    />
                    <Button
                        severity='success'
                        type='button'
                        icon='icon adms-blank'
                        tooltip='Download export to web form'
                    />
                </div>
            </div>
            <div className='grid'>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        lazy
                        value={historyList}
                        scrollable
                        scrollHeight='70vh'
                        rowsPerPageOptions={ROWS_PER_PAGE}
                        reorderableColumns
                        resizableColumns
                        className='export-web-table'
                        paginator
                        first={lazyState.first}
                        rows={lazyState.rows}
                        totalRecords={totalRecords}
                        onPage={(event) => setLazyState(event)}
                        onSort={(event) => setLazyState(event)}
                        sortOrder={lazyState.sortOrder}
                        sortField={lazyState.sortField}
                    >
                        {activeHistoryColumns.map(({ field, header }) => {
                            return (
                                <Column
                                    field={field}
                                    sortable
                                    header={header}
                                    reorderable={false}
                                    pt={{
                                        root: {
                                            style: {
                                                width: "100px",
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
    );
};
