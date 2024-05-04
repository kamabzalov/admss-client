import { BorderedCheckbox, CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { ReactElement, useCallback, useEffect, useState } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { observer } from "mobx-react-lite";
import { ListData } from "http/services/inventory-service";
import { useParams } from "react-router-dom";
import { Expenses } from "common/models/expenses";
import {
    deleteExpensesItem,
    getExpensesList,
    getExpensesListTypes,
    getExpensesListVendors,
    getExpensesTotal,
    setExpensesItem,
} from "http/services/expenses.service";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { Contact } from "common/models/contact";
import { ConfirmModal } from "dashboard/common/dialog/confirm";

export const PurchaseExpenses = observer((): ReactElement => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const { id } = useParams();

    const [expensesTypeList, setExpensesTypeList] = useState<ListData[]>([]);
    const [expensesVendorList, setExpensesVendorList] = useState<Contact[]>([]);
    const [expensesList, setExpensesList] = useState<Expenses[]>([]);
    const [expenseDate, setExpenseDate] = useState<string>("");
    const [expenseType, setExpenseType] = useState<number>(0);
    const [expenseAmount, setExpenseAmount] = useState<number>(0);
    const [expenseNotBillable, setExpenseNotBillable] = useState<boolean>(false);
    const [expenseVendor, setExpenseVendor] = useState<string>("");
    const [expenseNotes, setExpenseNotes] = useState<string>("");
    const [expenseTotal, setExpenseTotal] = useState<string>("$ 0.00");
    const [currentExpenseUid, setCurrentExpenseUid] = useState<string>("");
    const [confirmActive, setConfirmActive] = useState<boolean>(false);
    const [expandedRows, setExpandedRows] = useState<any[]>([]);

    const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
        { field: "operationdate", header: "Date" },
        { field: "type_name", header: "Type" },
        { field: "amount_text", header: "Amount" },
        { field: "NotBillable", header: "Not Billable" },
        { field: "vendor", header: "Vendor" },
    ];

    const getExpenses = useCallback(() => {
        if (id) {
            getExpensesList(id).then((response) => {
                if (response) {
                    setExpensesList(response);
                }
            });
            getExpensesTotal(id).then(
                (response) => response?.total && setExpenseTotal(response.total)
            );
        }
    }, [id]);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        setUser(authUser);
    }, []);

    useEffect(() => {
        getExpenses();
        if (user) {
            getExpensesListTypes(user.useruid).then((response) => {
                if (response) {
                    setExpensesTypeList(response);
                }
            });
            getExpensesListVendors(user.useruid).then((response) => {
                if (response) {
                    setExpensesVendorList(response);
                }
            });
        }
    }, [getExpenses, user]);

    const handleExpenseSubmit = () => {
        const expenseData: Partial<Expenses> & { inventoryuid: string } = {
            inventoryuid: id ? id : "",
            operationdate: expenseDate,
            type: expenseType,
            amount: expenseAmount * 100,
            vendor: expenseVendor,
            comment: expenseNotes,
        };
        setExpensesItem({ expenseuid: "0", expenseData }).then(() => getExpenses());
    };

    const handleDeleteExpenses = () => {
        currentExpenseUid && deleteExpensesItem(currentExpenseUid).then(() => getExpenses());
    };

    const deleteTemplate = ({ itemuid }: Expenses) => {
        return (
            <Button
                type='button'
                icon='icon adms-trash-can'
                tooltip='Delete'
                tooltipOptions={{ position: "mouse" }}
                className='purchase-expenses__delete-button p-button-text'
                onClick={() => {
                    setCurrentExpenseUid(itemuid);
                    setConfirmActive(true);
                }}
            />
        );
    };

    const rowExpansionTemplate = (data: Expenses) => {
        return (
            <div className='expanded-row'>
                <div className='expanded-row__label'>Notes: </div>
                <div className='expanded-row__text'>
                    Call Michael and ask him to send the missing documents to complete the deal.
                </div>
            </div>
        );
    };

    const handleRowExpansionClick = (data: Expenses) => {
        if (expandedRows.includes(data)) {
            setExpandedRows(expandedRows.filter((item) => item !== data));
            return;
        }
        setExpandedRows([...expandedRows, data]);
    };

    return (
        <>
            <div className='grid purchase-expenses'>
                <div className='col-6 grid row-gap-2'>
                    <div className='col-6'>
                        <DateInput
                            name='Date'
                            date={Date.parse(expenseDate)}
                            onChange={({ value }) =>
                                value && setExpenseDate(String(new Date(`${value}`)))
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <span className='p-float-label'>
                            <Dropdown
                                optionLabel='name'
                                optionValue='id'
                                filter
                                options={expensesTypeList}
                                value={expenseType}
                                onChange={({ value }) => value && setExpenseType(Number(value))}
                                className='w-full'
                            />

                            <label className='float-label'>Type</label>
                        </span>
                    </div>
                    <div className='col-12'>
                        <span className='p-float-label'>
                            <Dropdown
                                optionLabel='userName'
                                optionValue='contactuid'
                                filter
                                options={expensesVendorList}
                                value={expenseVendor}
                                onChange={({ value }) => value && setExpenseVendor(String(value))}
                                className='w-full'
                            />

                            <label className='float-label'>Vendor</label>
                        </span>
                    </div>
                    <div className='col-6'>
                        <CurrencyInput
                            labelPosition='top'
                            title='Amount'
                            value={expenseAmount}
                            onChange={({ value }) => {
                                value && setExpenseAmount(value);
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            checked={expenseNotBillable}
                            name='Not Billable'
                            onChange={() => {
                                setExpenseNotBillable(!expenseNotBillable);
                            }}
                        />
                    </div>
                </div>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <InputTextarea
                            className='purchase-expenses__text-area'
                            value={expenseNotes}
                            onChange={({ target: { value } }) => setExpenseNotes(value)}
                        />
                        <label className='float-label'>Notes</label>
                    </span>
                </div>

                <Button className='purchase-expenses__button' onClick={handleExpenseSubmit}>
                    Save
                </Button>
            </div>
            <div className='grid'>
                <div className='col-12'>
                    <DataTable
                        className='mt-6 purchase-expenses__table'
                        value={expensesList}
                        emptyMessage='No expenses yet.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                        rowExpansionTemplate={rowExpansionTemplate}
                        expandedRows={expandedRows}
                        onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                        pt={{
                            wrapper: {
                                className: "overflow-x-hidden",
                                style: {
                                    height: "249px",
                                },
                            },
                        }}
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            body={(options, { expander }) => {
                                return (
                                    <div className='flex gap-3 align-items-center'>
                                        <Button
                                            type='button'
                                            icon='icon adms-edit-item'
                                            tooltip='Edit'
                                            tooltipOptions={{ position: "mouse" }}
                                            className={`purchase-expenses__table-button purchase-expenses__table-button--success p-button-text`}
                                            onClick={() => {}}
                                        />
                                        <Button
                                            type='button'
                                            icon='pi pi-angle-down'
                                            tooltip='Edit'
                                            tooltipOptions={{ position: "mouse" }}
                                            className={`purchase-expenses__table-button p-button-text ${
                                                expandedRows.some((item) => {
                                                    return item === options;
                                                }) && "table-button-active"
                                            }`}
                                            onClick={() => handleRowExpansionClick(options)}
                                        />
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
                        <Column
                            body={deleteTemplate}
                            pt={{
                                root: {
                                    style: {
                                        width: "20px",
                                    },
                                },
                            }}
                        ></Column>
                    </DataTable>
                </div>
                <div className='col-12 total-sum flex justify-content-end '>
                    <span className='total-sum__label'>Total expenses:</span>
                    <span className='total-sum__value'> {expenseTotal}</span>
                </div>
            </div>
            <ConfirmModal
                visible={confirmActive}
                bodyMessage='Do you really want to delete this expense? 
                This process cannot be undone.'
                confirmAction={handleDeleteExpenses}
                draggable={false}
                rejectLabel='Cancel'
                acceptLabel='Delete'
                className='expenses-confirm-dialog'
                onHide={() => setConfirmActive(false)}
            />
        </>
    );
});
