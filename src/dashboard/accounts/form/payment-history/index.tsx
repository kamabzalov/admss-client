import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useParams } from "react-router-dom";
import { listAccountHistory } from "http/services/accounts.service";
import { AccountHistory } from "common/models/accounts";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountHistory | "";
}

const renderColumnsData: Pick<TableColumnProps, "header" | "field">[] = [
    { field: "", header: "Status" },
    { field: "RECEIPT_NUM", header: "Receipt#" },
    { field: "Type", header: "Type" },
    { field: "Pmt_Date", header: "Date" },
    { field: "Late_Date", header: "Days Late" },
    { field: "", header: "Method" },
    { field: "Balance", header: "Bal.Increase" },
    { field: "", header: "Payment" },
];

export const AccountPaymentHistory = (): ReactElement => {
    const { id } = useParams();
    const [historyList, setHistoryList] = useState<AccountHistory[]>([]);

    useEffect(() => {
        if (id) {
            listAccountHistory(id).then((res) => {
                if (Array.isArray(res) && res.length) setHistoryList(res);
            });
        }
    }, [id]);

    return (
        <div className='account-history'>
            <h3 className='account-history__title account-title'>Payment History</h3>
            <div className='grid'>
                <div className='col-3'>
                    <Dropdown
                        className='w-full'
                        options={["All Payments", "Sold", "Unsold"]}
                        value='All Payments'
                    />
                </div>
                <div className='col-3 ml-auto'>
                    <Dropdown className='w-full' options={["Take Payment"]} value='Take Payment' />
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='mt-6 account-history__table'
                        value={historyList}
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
            </div>
            <div className='col-12 flex gap-3'>
                <Button className='account-history__button'>Print</Button>
                <Button className='account-history__button'>Download</Button>
            </div>
        </div>
    );
};
