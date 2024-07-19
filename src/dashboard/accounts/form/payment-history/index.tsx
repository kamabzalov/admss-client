import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { ReactElement } from "react";
import "./index.css";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "status", header: "Status" },
    { field: "receiptNo", header: "Receipt#" },
    { field: "type", header: "Type" },
    { field: "date", header: "Date" },
    { field: "days_late", header: "Days Late" },
    { field: "method", header: "Method" },
    { field: "bal_increase", header: "Bal.Increase" },
    { field: "payment", header: "Payment" },
];

export const AccountPaymentHistory = (): ReactElement => {
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
                        className='mt-6 account-history__table'
                        value={[]}
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
