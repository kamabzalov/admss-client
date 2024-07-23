import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { ReactElement } from "react";
import "./index.css";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "Pay Date", header: "Pay Date" },
    { field: "Note Taker", header: "Note Taker" },
    { field: "amount", header: "Amount" },
];

export const AccountPromiseToPay = (): ReactElement => {
    return (
        <div className='account-promise'>
            <h3 className='account-promise__title account-title'>Promise to pay</h3>
            <div className='grid'>
                <div className='col-3'>
                    <Dropdown className='w-full' options={["Add Promise"]} value='Add Promise' />
                </div>
                <div className='col-3 ml-auto'>
                    <Dropdown
                        className='w-full'
                        options={["Set Paid As Promised"]}
                        value='Set Paid As Promised'
                    />
                </div>
                <div className='col-12'>
                    <DataTable
                        showGridlines
                        className='mt-6 account-promise__table'
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
                <Button className='account-promise__button'>Print</Button>
                <Button className='account-promise__button'>Download</Button>
            </div>
        </div>
    );
};
