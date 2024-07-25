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
import { ACCOUNT_PAYMENT_STATUS_LIST } from "common/constants/account-options";
import {
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectPanelHeaderTemplateEvent,
} from "primereact/multiselect";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountHistory | "";
}

export type TableColumnsList = Pick<TableColumnProps, "header" | "field"> & { checked: boolean };

const renderColumnsData: TableColumnsList[] = [
    { field: "", header: "Status", checked: true },
    { field: "RECEIPT_NUM", header: "Receipt#", checked: true },
    { field: "Type", header: "Type", checked: true },
    { field: "Pmt_Date", header: "Date", checked: true },
    { field: "Late_Date", header: "Days Late", checked: true },
    { field: "", header: "Method", checked: true },
    { field: "Balance", header: "Bal.Increase", checked: true },
    { field: "", header: "Payment", checked: true },
];

export const AccountPaymentHistory = (): ReactElement => {
    const { id } = useParams();
    const [historyList, setHistoryList] = useState<AccountHistory[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<string>(
        ACCOUNT_PAYMENT_STATUS_LIST[0].name
    );
    const [activeColumns, setActiveColumns] = useState<TableColumnsList[]>([]);

    useEffect(() => {
        if (id) {
            listAccountHistory(id).then((res) => {
                if (Array.isArray(res) && res.length) setHistoryList(res);
            });
        }
        setActiveColumns(renderColumnsData.filter(({ checked }) => checked));
    }, [id]);

    const dropdownHeaderPanel = ({ onCloseClick }: MultiSelectPanelHeaderTemplateEvent) => {
        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        onChange={() => {
                            if (renderColumnsData.length === activeColumns.length) {
                                setActiveColumns(
                                    renderColumnsData.filter(({ checked }) => checked)
                                );
                            } else {
                                setActiveColumns(renderColumnsData);
                            }
                        }}
                        checked={renderColumnsData.length === activeColumns.length}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    className='p-multiselect-close p-link'
                    onClick={(e) => {
                        setActiveColumns(renderColumnsData.filter(({ checked }) => checked));
                        onCloseClick(e);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

    return (
        <div className='account-history account-card'>
            <h3 className='account-history__title account-title'>Payment History</h3>
            <div className='grid account__body'>
                <div className='col-12 account__control'>
                    <Dropdown
                        className='account__dropdown'
                        options={ACCOUNT_PAYMENT_STATUS_LIST}
                        optionValue='name'
                        optionLabel='name'
                        value={selectedPayment}
                        onChange={({ target: { value } }) => setSelectedPayment(value)}
                    />
                    <MultiSelect
                        options={renderColumnsData}
                        value={activeColumns}
                        optionLabel='header'
                        onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                            stopPropagation();
                            const sortedValue = value.sort(
                                (a: TableColumnsList, b: TableColumnsList) => {
                                    const firstIndex = renderColumnsData.findIndex(
                                        (col) => col.field === a.field
                                    );
                                    const secondIndex = renderColumnsData.findIndex(
                                        (col) => col.field === b.field
                                    );
                                    return firstIndex - secondIndex;
                                }
                            );

                            setActiveColumns(sortedValue);
                        }}
                        panelHeaderTemplate={dropdownHeaderPanel}
                        className='account__dropdown flex align-items-center column-picker'
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
                    <Dropdown
                        className='account__dropdown ml-auto'
                        options={["Take Payment"]}
                        value='Take Payment'
                    />
                </div>
                <div className='col-12 account__table'>
                    <DataTable
                        showGridlines
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
                        {activeColumns.map(({ field, header }) => (
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
                {!!historyList.length && (
                    <div className='col-12 flex gap-3'>
                        <Button className='account-history__button'>Print</Button>
                        <Button className='account-history__button'>Download</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
