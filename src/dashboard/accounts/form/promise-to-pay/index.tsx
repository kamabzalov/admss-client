import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { listAccountPromises } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { AccountPromise } from "common/models/accounts";
import { SplitButton } from "primereact/splitbutton";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountPromise | "";
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

const renderColumnsData: Pick<TableColumnsList, "header" | "field">[] = [
    { field: "paydate", header: "Pay Date" },
    { field: "username", header: "Note Taker" },
    { field: "amount", header: "Amount" },
];

enum PAID_STATUS {
    LATE = "Late",
    BROKEN = "Broken",
    OUTSTANDING = "Outstanding",
}

export const AccountPromiseToPay = (): ReactElement => {
    const { id } = useParams();
    const [promiseList, setPromiseList] = useState<AccountPromise[]>([]);
    const [selectedPaid, setSelectedPaid] = useState<PAID_STATUS | null>(null);

    useEffect(() => {
        id &&
            listAccountPromises(id).then((res) => {
                if (Array.isArray(res) && res.length) setPromiseList(res);
            });
    }, [id]);

    const promiseItems = [
        {
            label: "Edit Promise",
            icon: `icon adms-edit-item`,
            command: () => {},
        },
        {
            label: "Delete Promise",
            icon: `pi pi-times`,
            command: () => {},
        },
    ];

    const paymentItems = [
        {
            label: "Set Paid Late",
            icon: `pi pi-circle${selectedPaid === PAID_STATUS.LATE ? "-fill" : ""}`,
            command: () => {
                setSelectedPaid(PAID_STATUS.LATE);
            },
        },
        {
            label: "Set Promise Broken",
            icon: `pi pi-circle${selectedPaid === PAID_STATUS.BROKEN ? "-fill" : ""}`,
            command: () => {
                setSelectedPaid(PAID_STATUS.BROKEN);
            },
        },
        {
            label: "Set Outstanding",
            icon: `pi pi-circle${selectedPaid === PAID_STATUS.OUTSTANDING ? "-fill" : ""}`,
            command: () => {
                setSelectedPaid(PAID_STATUS.OUTSTANDING);
            },
        },
    ];

    return (
        <div className='account-promise account-card'>
            <h3 className='account-promise__title account-title'>Promise to pay</h3>
            <div className='grid account__body'>
                <div className='col-12 account__control'>
                    <SplitButton
                        model={promiseItems}
                        className='account__split-button'
                        label='Add Promise'
                        tooltip='Add Promise'
                        tooltipOptions={{
                            position: "bottom",
                        }}
                        onClick={() => {}}
                        outlined
                    />
                    <SplitButton
                        model={paymentItems}
                        className='account__split-button ml-auto'
                        label='Set Paid As Promised'
                        tooltip='Set Paid As Promised'
                        tooltipOptions={{
                            position: "bottom",
                        }}
                        onClick={() => {}}
                        outlined
                        pt={{
                            root: {
                                style: {
                                    width: "340px",
                                },
                            },
                        }}
                    />
                </div>
                <div className='col-12 account__table'>
                    <DataTable
                        showGridlines
                        className='account-promise__table'
                        value={promiseList}
                        emptyMessage='No activity yet.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            body={() => {
                                return (
                                    <div className='flex gap-3 align-items-center'>
                                        <Checkbox checked={false} />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "60px",
                                    },
                                },
                            }}
                        />
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                alignHeader={"left"}
                                key={field}
                                headerClassName='cursor-move'
                                className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                            />
                        ))}
                    </DataTable>
                </div>
                {!!promiseList.length && (
                    <div className='col-12 flex gap-3'>
                        <Button className='account-promise__button'>Print</Button>
                        <Button className='account-promise__button'>Download</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
