import { ReactElement, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import { store } from "store";
import { getExportHistoryList } from "http/services/export-to-web.service";
import { MultiSelect, MultiSelectChangeEvent } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";

interface HistoryColumnProps extends ColumnProps {
    field: keyof HistoryList;
}

type HistoryColumnsList = Pick<HistoryColumnProps, "header" | "field"> & { checked: boolean };

const historyColumns: HistoryColumnsList[] = [
    { field: "Number", header: "#", checked: true },
    { field: "Status", header: "Status", checked: true },
    { field: "Created", header: "Created", checked: true },
    { field: "Type", header: "Type", checked: true },
    { field: "Info", header: "Info", checked: true },
    { field: "LastRun", header: "Last Run", checked: true },
    { field: "NextRun", header: "Next Run", checked: true },
];

interface HistoryList {
    Number: number;
    Status: string;
    Created: string;
    Type: string;
    Info: string;
    LastRun: string;
    NextRun: string;
}

const historyData: HistoryList[] = [
    {
        Number: 1,
        Status: "In Progress",
        Created: "06/25/2024 10:40:48 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/25/2024 10:40:48 AM",
        NextRun: "06/25/2024 10:40:48 PM",
    },
    {
        Number: 2,
        Status: "Completed",
        Created: "06/24/2024 09:30:12 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/24/2024 09:30:12 AM",
        NextRun: "06/24/2024 09:30:12 PM",
    },
    {
        Number: 3,
        Status: "Failed",
        Created: "06/23/2024 08:20:05 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/23/2024 08:20:05 AM",
        NextRun: "06/23/2024 08:20:05 PM",
    },
    {
        Number: 4,
        Status: "In Progress",
        Created: "06/22/2024 07:10:32 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/22/2024 07:10:32 AM",
        NextRun: "06/22/2024 07:10:32 PM",
    },
    {
        Number: 5,
        Status: "Completed",
        Created: "06/21/2024 06:00:48 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/21/2024 06:00:48 AM",
        NextRun: "06/21/2024 06:00:48 PM",
    },
    {
        Number: 6,
        Status: "Failed",
        Created: "06/20/2024 04:50:15 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/20/2024 04:50:15 AM",
        NextRun: "06/20/2024 04:50:15 PM",
    },
    {
        Number: 7,
        Status: "In Progress",
        Created: "06/19/2024 03:40:02 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/19/2024 03:40:02 AM",
        NextRun: "06/19/2024 03:40:02 PM",
    },
    {
        Number: 8,
        Status: "Completed",
        Created: "06/18/2024 02:30:11 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/18/2024 02:30:11 AM",
        NextRun: "06/18/2024 02:30:11 PM",
    },
    {
        Number: 9,
        Status: "Failed",
        Created: "06/17/2024 01:20:28 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/17/2024 01:20:28 AM",
        NextRun: "06/17/2024 01:20:28 PM",
    },
    {
        Number: 10,
        Status: "In Progress",
        Created: "06/16/2024 12:10:44 AM",
        Type: "cars.com",
        Info: "Message from backend",
        LastRun: "06/16/2024 12:10:44 AM",
        NextRun: "06/16/2024 12:10:44 PM",
    },
];

export const ExportHistory = (): ReactElement => {
    const userStore = store.userStore;
    const { authUser } = userStore;
    const [historyList] = useState<HistoryList[]>(historyData);
    const [activeHistoryColumns, setActiveHistoryColumns] =
        useState<HistoryColumnsList[]>(historyColumns);

    useEffect(() => {
        if (authUser) {
            getExportHistoryList(authUser.useruid).then(() => {
                // response && setHistoryList(response);
            });
        }
    }, [authUser]);

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
                    >
                        {activeHistoryColumns.map(({ field, header }) => {
                            return (
                                <Column
                                    bodyStyle={{ textAlign: "center" }}
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

