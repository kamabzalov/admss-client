import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { listAccountPayments } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { Menubar } from "primereact/menubar";

interface TableColumnProps extends ColumnProps {
    field: any;
}

const renderColumnsData: Pick<TableColumnProps, "header" | "field">[] = [
    { field: "receiptNo", header: "Receipt#" },
    { field: "date", header: "Date" },
    { field: "amount", header: "Amount" },
    { field: "payed", header: "Payed" },
];

export const AccountDownPayment = (): ReactElement => {
    const { id } = useParams();
    const [paymentList, setPaymentList] = useState<any>([]);

    useEffect(() => {
        if (id) {
            listAccountPayments(id).then((res) => {
                if (Array.isArray(res) && res.length) setPaymentList(res);
            });
        }
    }, [id]);

    return (
        <div className='down-payment account-card'>
            <h3 className='down-payment__title account-title'>Down Payment</h3>
            <div className='down-payment__header grid'>
                <div className='col-4'>
                    <span className='font-bold'>Contact Cash Down: </span>
                    <span>$ 0.00</span>
                </div>
                <div className='col-4'>
                    <span className='font-bold'>Cash Down Payment: </span>
                    <span>$ 0.00</span>
                </div>
                <div className='col-4'>
                    <span className='font-bold'>Cash Dow Balance: </span>
                    <span>$ 0.00</span>
                </div>
            </div>

            <div className='splitter my-5'>
                <h3 className='splitter__title m-0 pr-3'>Scheduled down payments</h3>
                <hr className='splitter__line flex-1' />
            </div>

            <div className='grid account__body'>
                <div className='col-3 ml-auto'>
                    <Menubar
                        className='account__menubar ml-auto'
                        model={[
                            {
                                label: "Take Payment",
                                items: [
                                    {
                                        label: "Delete Payment",
                                        icon: "icon adms-close",
                                    },
                                ],
                            },
                        ]}
                    />
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='account__table'
                        value={paymentList}
                        emptyMessage='No activity yet.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            body={(options) => {
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
