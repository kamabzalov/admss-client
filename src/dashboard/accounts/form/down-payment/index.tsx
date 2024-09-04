import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { listAccountDownPayments } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { AccountDownPayments } from "common/models/accounts";
import { useToast } from "dashboard/common/toast";
import { SplitButton } from "primereact/splitbutton";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountDownPayments;
}

const renderColumnsData: Pick<TableColumnProps, "header" | "field">[] = [
    { field: "Receipt", header: "Receipt#" },
    { field: "Date", header: "Date" },
    { field: "Amount", header: "Amount" },
    { field: "Paid", header: "Payed" },
];

export const AccountDownPayment = (): ReactElement => {
    const { id } = useParams();
    const toast = useToast();
    const [paymentList, setPaymentList] = useState<AccountDownPayments[]>([]);

    useEffect(() => {
        if (id) {
            listAccountDownPayments(id).then((res) => {
                if (Array.isArray(res) && res.length) setPaymentList(res);
            });
        }
    }, [id]);

    const takePaymentItems = [
        {
            label: "Delete Payment",
            icon: "icon adms-close",
            command: () => {
                toast.current?.show({
                    severity: "success",
                    summary: "Updated",
                    detail: "Data Updated",
                });
            },
        },
    ];

    return (
        <div className='down-payment account-card'>
            <h3 className='down-payment__title account-title'>Down Payment</h3>
            <div className='down-payment__header grid'>
                <div className='col-4'>
                    <span className='font-bold down-payment__label'>Contact Cash Down: </span>
                    <span>$ 0.00</span>
                </div>
                <div className='col-4'>
                    <span className='font-bold down-payment__label'>Cash Down Payment: </span>
                    <span>$ 0.00</span>
                </div>
                <div className='col-4'>
                    <span className='font-bold down-payment__label'>Cash Dow Balance: </span>
                    <span>$ 0.00</span>
                </div>
            </div>

            <div className='splitter my-5'>
                <h3 className='splitter__title m-0 pr-3'>Scheduled down payments</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='grid account__body'>
                <div className='col-3 ml-auto'>
                    <SplitButton
                        model={takePaymentItems}
                        className='account__split-button ml-auto'
                        label='Take Payment'
                        tooltip='Take Payment'
                        tooltipOptions={{
                            position: "bottom",
                        }}
                        outlined
                    />
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='account__table'
                        value={paymentList}
                        emptyMessage='No payments yet.'
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
                {!!paymentList.length && (
                    <div className='col-12 flex gap-3 align-items-end justify-content-start'>
                        <Button className='down-payment__button'>Print</Button>
                        <Button className='down-payment__button'>Download</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
