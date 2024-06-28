import { ReactElement, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import { store } from "store";
import { getExportScheduleList } from "http/services/export-to-web.service";
import "./index.css";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { ExportWebScheduleList } from "common/models/export-web";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import { QueryParams } from "common/models/query-params";

interface ScheduleColumnProps extends ColumnProps {
    field: keyof ExportWebScheduleList;
}

type ScheduleColumnsList = Pick<ScheduleColumnProps, "header" | "field"> & { checked: boolean };

const scheduleColumns: ScheduleColumnsList[] = [
    { field: "id", header: "#", checked: true },
    { field: "lasttatus", header: "Status", checked: true },
    { field: "created", header: "Created", checked: true },
    { field: "tasktype", header: "Type", checked: true },
    { field: "lasttrun", header: "Last Run", checked: true },
    { field: "nextrun", header: "Next Run", checked: true },
];

export const ExportSchedule = (): ReactElement => {
    const userStore = store.userStore;
    const { authUser } = userStore;
    const [scheduleList, setScheduleList] = useState<ExportWebScheduleList[]>([]);
    const [activeScheduleColumns, setActiveScheduleColumns] =
        useState<ScheduleColumnsList[]>(scheduleColumns);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);

    const handleGetExportScheduleList = async (params: QueryParams, total?: boolean) => {
        if (authUser) {
            if (total) {
                getExportScheduleList(authUser.useruid, { ...params, total: 1 }).then(
                    (response) => {
                        if (response && !Array.isArray(response)) {
                            setTotalRecords(response.total ?? 0);
                        }
                    }
                );
            }
            getExportScheduleList(authUser.useruid, params).then((response) => {
                if (Array.isArray(response)) {
                    setScheduleList(response);
                } else {
                    setScheduleList([]);
                }
            });
        }
    };

    useEffect(() => {
        if (authUser) {
            handleGetExportScheduleList(lazyState, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser, lazyState]);

    const dropdownHeaderPanel = (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    checked={scheduleColumns.length === activeScheduleColumns.length}
                    onChange={() => {
                        setActiveScheduleColumns(scheduleColumns);
                    }}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={() => {
                    return setActiveScheduleColumns(
                        scheduleColumns.filter(({ checked }) => checked)
                    );
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );

    return (
        <div className='card-content schedule'>
            <div className='grid datatable-controls'>
                <div className='col-12 export-web-controls'>
                    <div className='export-web-controls__input'>
                        <MultiSelect
                            showSelectAll={false}
                            value={activeScheduleColumns}
                            optionLabel='header'
                            options={scheduleColumns}
                            onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                                stopPropagation();
                                const sortedValue = value.sort(
                                    (a: ScheduleColumnsList, b: ScheduleColumnsList) => {
                                        const firstIndex = scheduleColumns.findIndex(
                                            (col) => col.field === a.field
                                        );
                                        const secondIndex = scheduleColumns.findIndex(
                                            (col) => col.field === b.field
                                        );
                                        return firstIndex - secondIndex;
                                    }
                                );

                                setActiveScheduleColumns(sortedValue);
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
                        value={scheduleList}
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
                        {activeScheduleColumns.map(({ field, header }) => {
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
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            reorderable={false}
                            body={() => {
                                return (
                                    <div className='schedule-control'>
                                        <Button
                                            outlined
                                            className='text schedule-button'
                                            icon='icon adms-pause'
                                        />
                                        <Button
                                            outlined
                                            className='text schedule-button'
                                            icon='icon adms-play-prev'
                                        />
                                        <Button
                                            outlined
                                            className='text schedule-button'
                                            icon='icon adms-trash-can'
                                        />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "100px",
                                        padding: "0 15px",
                                    },
                                },
                            }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
