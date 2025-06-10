import { BorderedCheckbox, CurrencyInput, DateInput } from "dashboard/common/form/inputs";
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import "./index.css";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { DataTable, DataTableRowClickEvent } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { observer } from "mobx-react-lite";
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
import { Contact } from "common/models/contact";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { ListData } from "common/models";
import { ComboBox } from "dashboard/common/form/dropdown";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";
import { convertToStandardTimestamp } from "common/helpers";

export const PurchaseExpenses = observer((): ReactElement => {
    const { id } = useParams();
    const toast = useToast();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const [expensesTypeList, setExpensesTypeList] = useState<ListData[]>([]);
    const [expensesVendorList, setExpensesVendorList] = useState<Contact[]>([]);
    const [expensesList, setExpensesList] = useState<Expenses[]>([]);
    const [currentEditExpense, setCurrentEditExpense] = useState<Expenses>({} as Expenses);
    const [expenseTotal, setExpenseTotal] = useState<string>("$ 0.00");
    const [confirmActive, setConfirmActive] = useState<boolean>(false);
    const [expandedRows, setExpandedRows] = useState<Record<string, any>[]>([]);

    const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
        { field: "operationdate", header: "Date" },
        { field: "type_name", header: "Type" },
        { field: "amount_text", header: "Amount" },
        { field: "notbillable", header: "Not Billable" },
        { field: "vendor_name", header: "Vendor" },
    ];

    const getExpenses = useCallback(() => {
        if (id) {
            getExpensesList(id).then((response) => {
                if (Array.isArray(response)) {
                    setExpensesList(response);
                }
            });
            getExpensesTotal(id).then(
                (response) => response?.total && setExpenseTotal(response.total)
            );
        }
    }, [id]);

    const handleCompareData = useMemo(() => {
        if (!currentEditExpense?.itemuid) {
            return (
                !currentEditExpense?.operationdate ||
                !currentEditExpense?.amount ||
                !currentEditExpense?.vendor
            );
        }

        const currentExpense = expensesList.find(
            (item) => item.itemuid === currentEditExpense?.itemuid
        );
        if (currentExpense) {
            const isDataChanged =
                currentExpense.operationdate !== currentEditExpense?.operationdate ||
                currentExpense.type !== currentEditExpense?.type ||
                currentExpense.amount !== currentEditExpense?.amount ||
                currentExpense.vendor !== currentEditExpense?.vendor ||
                currentExpense.comment !== currentEditExpense?.comment ||
                currentExpense.notbillable !== currentEditExpense?.notbillable;
            return !isDataChanged;
        }
        return false;
    }, [expensesList, currentEditExpense]);

    const handleGetExpensesTypes = async () => {
        const response = await getExpensesListTypes(authUser!.useruid);
        if (response && Array.isArray(response)) {
            setExpensesTypeList(response);
        }
    };

    const handleGetExpensesVendors = async () => {
        const response = await getExpensesListVendors(authUser!.useruid);
        if (response && Array.isArray(response)) {
            setExpensesVendorList(response);
        }
    };

    useEffect(() => {
        getExpenses();
        handleGetExpensesTypes();
        handleGetExpensesVendors();
    }, [getExpenses]);

    const handleClearExpense = () => {
        setCurrentEditExpense({} as Expenses);
    };

    const handleExpenseSubmit = async (itemuid?: string) => {
        const expenseData: Partial<Expenses> & { inventoryuid: string } = {
            inventoryuid: id ? id : "",
            operationdate: convertToStandardTimestamp(currentEditExpense?.operationdate),
            type: currentEditExpense?.type || 0,
            amount: (currentEditExpense?.amount && currentEditExpense?.amount * 100) || 0,
            vendor: currentEditExpense?.vendor || "",
            comment: currentEditExpense?.comment || "",
            notbillable: currentEditExpense?.notbillable || 0,
        };

        const response = await setExpensesItem({ expenseuid: itemuid || "0", expenseData });
        if (response?.error) {
            toast?.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.message,
            });
        } else {
            handleClearExpense();
            getExpenses();
            toast?.current?.show({
                severity: "success",
                summary: "Success",
                detail:
                    response?.message ||
                    `Expense is successfully ${itemuid ? "updated" : "saved"}!`,
            });
        }
    };

    const handleDeleteExpenses = async () => {
        const response = await deleteExpensesItem(currentEditExpense.itemuid);
        if (response?.error) {
            toast?.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.message,
            });
        } else {
            getExpenses();
            handleClearExpense();
            toast?.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Expense is successfully deleted!",
            });
        }
    };

    const deleteTemplate = (expense: Expenses) => {
        return (
            <Button
                type='button'
                icon='icon adms-trash-can'
                tooltip='Delete'
                tooltipOptions={{ showDelay: 300 }}
                className='purchase-expenses__delete-button p-button-text'
                onClick={() => {
                    setCurrentEditExpense(expense);
                    setConfirmActive(true);
                }}
            />
        );
    };

    const handleEditExpenses = (expense: Expenses) => {
        if (expense) {
            setCurrentEditExpense({ ...expense, amount: expense.amount / 100 });
        }
    };

    const rowExpansionTemplate = (data: Expenses) => {
        return (
            <div className='expanded-row'>
                <div className='expanded-row__label'>Notes: </div>
                <div className='expanded-row__text'>{data.comment}</div>
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
                            date={Date.parse(String(currentEditExpense?.operationdate))}
                            emptyDate
                            onChange={({ value }) =>
                                value &&
                                currentEditExpense &&
                                setCurrentEditExpense({
                                    ...currentEditExpense,
                                    operationdate: String(new Date(`${value}`)),
                                })
                            }
                        />
                    </div>
                    <div className='col-6'>
                        <ComboBox
                            optionLabel='name'
                            optionValue='index'
                            options={expensesTypeList}
                            value={currentEditExpense?.type}
                            onChange={({ value }) =>
                                value &&
                                currentEditExpense &&
                                setCurrentEditExpense({ ...currentEditExpense, type: value })
                            }
                            className='w-full purchase-expenses__dropdown'
                            label='Type'
                        />
                    </div>
                    <div className='col-12'>
                        <ComboBox
                            optionLabel='userName'
                            optionValue='contactuid'
                            filter
                            options={expensesVendorList}
                            value={currentEditExpense?.vendor || ""}
                            onChange={({ value }) =>
                                value &&
                                currentEditExpense &&
                                setCurrentEditExpense({ ...currentEditExpense, vendor: value })
                            }
                            className='w-full purchase-expenses__dropdown'
                            label='Vendor'
                        />
                    </div>
                    <div className='col-6'>
                        <CurrencyInput
                            labelPosition='top'
                            title='Amount'
                            value={currentEditExpense?.amount || 0}
                            onChange={({ value }) =>
                                value &&
                                currentEditExpense &&
                                setCurrentEditExpense({ ...currentEditExpense, amount: value })
                            }
                            pt={{
                                input: {
                                    root: {
                                        className: !currentEditExpense?.amount ? "color-gray" : "",
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className='col-6'>
                        <BorderedCheckbox
                            checked={!!currentEditExpense?.notbillable}
                            onChange={() =>
                                setCurrentEditExpense({
                                    ...currentEditExpense,
                                    notbillable: !currentEditExpense?.notbillable ? 1 : 0,
                                })
                            }
                            name='Not Billable'
                        />
                    </div>
                </div>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <InputTextarea
                            className='purchase-expenses__text-area'
                            value={currentEditExpense?.comment || ""}
                            onChange={({ target: { value } }) =>
                                value &&
                                currentEditExpense &&
                                setCurrentEditExpense({ ...currentEditExpense, comment: value })
                            }
                        />
                        <label className='float-label'>Notes</label>
                    </span>
                </div>
                <div className='purchase-expenses-controls'>
                    {currentEditExpense?.itemuid && (
                        <Button
                            className='purchase-expenses-controls__button'
                            onClick={() => handleClearExpense()}
                            outlined
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        className='purchase-expenses-controls__button'
                        type='button'
                        disabled={handleCompareData}
                        severity={handleCompareData ? "secondary" : "success"}
                        onClick={() => handleExpenseSubmit(currentEditExpense?.itemuid)}
                    >
                        {currentEditExpense?.itemuid ? "Update" : "Save"}
                    </Button>
                </div>
            </div>
            <div className='grid'>
                <div className='col-12'>
                    <DataTable
                        className='purchase-expenses__table'
                        value={expensesList}
                        emptyMessage='No expenses yet.'
                        reorderableColumns
                        resizableColumns
                        showGridlines
                        scrollable
                        rowExpansionTemplate={rowExpansionTemplate}
                        expandedRows={expandedRows}
                        onRowToggle={(e: DataTableRowClickEvent) => setExpandedRows([e.data])}
                        pt={{
                            wrapper: {
                                className: "thin-scrollbar",
                                style: {
                                    height: "205px",
                                },
                            },
                        }}
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            bodyClassName='purchase-expenses__table-controls'
                            frozen
                            body={(options) => {
                                const isRowExpanded = expandedRows.some((item) => {
                                    return item === options;
                                });
                                return (
                                    <div className='purchase-expenses__table-controls-container'>
                                        <Button
                                            type='button'
                                            icon='icon adms-edit-item'
                                            tooltip='Edit'
                                            tooltipOptions={{ showDelay: 300 }}
                                            className={`purchase-expenses__table-button purchase-expenses__table-button--success p-button-text`}
                                            onClick={() => handleEditExpenses(options)}
                                        />
                                        <Button
                                            type='button'
                                            icon='pi pi-angle-down'
                                            tooltip={
                                                isRowExpanded
                                                    ? "Hide commentary"
                                                    : "Show commentary"
                                            }
                                            tooltipOptions={{ showDelay: 300 }}
                                            disabled={!options?.comment}
                                            className={`purchase-expenses__table-button p-button-text ${
                                                isRowExpanded && "table-button-active"
                                            }`}
                                            onClick={() => handleRowExpansionClick(options)}
                                        />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "70px",
                                    },
                                },
                            }}
                        />
                        {renderColumnsData.map(({ field, header }) =>
                            field === "notbillable" ? (
                                <Column
                                    field={field}
                                    header={header}
                                    alignHeader={"left"}
                                    body={(options) => <>{options[field] ? "Yes" : "No"}</>}
                                    key={field}
                                    headerClassName='cursor-move'
                                    className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                                />
                            ) : (
                                <Column
                                    field={field}
                                    header={header}
                                    alignHeader={"left"}
                                    key={field}
                                    headerClassName='cursor-move'
                                    className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                                />
                            )
                        )}

                        <Column
                            body={deleteTemplate}
                            frozen
                            alignFrozen='right'
                            pt={{
                                root: {
                                    style: {
                                        width: "20px",
                                    },
                                },
                            }}
                        />
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
