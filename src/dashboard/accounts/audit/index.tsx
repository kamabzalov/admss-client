import { ReactElement, useEffect, useState } from "react";
import { DatatableQueries, initialDataTableQueries } from "common/models/datatable-queries";
import {
    DataTable,
    DataTablePageEvent,
    DataTableRowClickEvent,
    DataTableSortEvent,
    DataTableValue,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { ROWS_PER_PAGE } from "common/settings";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import AuditHeader from "./components/AuditHeader";
import { useCreateReport, useToastMessage } from "common/hooks";
import { getAccountAudit } from "http/services/accounts.service";
import { AuditRecord } from "common/models/accounts";
import { AccountsAuditUserSettings } from "common/models/user";
import { ACCOUNT_AUDIT_TYPES } from "common/constants/account-options";
import { useUserProfileSettings } from "common/hooks/useUserProfileSettings";
import { TableColumn } from "dashboard/common/filter";
import { Task } from "common/models/tasks";
import { ExpansionColumn, rowExpansionTemplate } from "dashboard/common/data-table";
import { ACCOUNTS_PAGE } from "common/constants/links";
import { useNavigate } from "react-router-dom";

type AuditColumn = { field: keyof AuditRecord; header: string };

enum AUDIT_LABELS {
    ACCOUNT = "Account",
    LINE_NUMBER = "Line#",
    USER = "User",
    DATE = "Date",
    DEBIT = "Debit",
    CREDIT = "Credit",
    DESCRIPTION = "Description",
    NOTE = "Note",
    EFFECTIVE_DATE = "Effective Date",
    NAME = "Name",
    INSURANCE_COMPANY = "Insurance Company",
    INSURANCE_POLICY = "Ins. Policy#",
    INSURANCE_EXPIRATION_DATE = "Ins. Exp. Date",
    TERM = "Term",
    PAYMENT_AMOUNT = "Pmt. Amt",
    CURRENT_DUE = "Current Due",
    NEXT_PAYMENT_DUE = "Next Pmt. Due",
    STATUS = "Status",
    DATE_SOLD = "Date Sold",
    YEAR = "Year",
    MAKE = "Make",
    MODEL = "Model",
    VIN = "VIN",
    DATE_AND_TIME = "Date and Time",
    TAKEN_BY = "Taken By",
    CONTACT_METHOD = "Contact Method",
    PROMISE_DATE = "Promise Date",
    PROMISE_AMOUNT = "Promise Amt.",
}

const getColumnsByAuditType = (auditType: ACCOUNT_AUDIT_TYPES | undefined): AuditColumn[] => {
    switch (auditType) {
        case ACCOUNT_AUDIT_TYPES.ACTIVITY_FOR_TODAY:
        case ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_7_DAYS:
        case ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_31_DAYS:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "index", header: AUDIT_LABELS.LINE_NUMBER },
                { field: "name", header: AUDIT_LABELS.USER },
                { field: "created", header: AUDIT_LABELS.DATE },
                { field: "startingballance", header: AUDIT_LABELS.DEBIT },
                { field: "downpayment", header: AUDIT_LABELS.CREDIT },
            ];

        case ACCOUNT_AUDIT_TYPES.INSURANCE_MISSING:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "dateeffective", header: AUDIT_LABELS.EFFECTIVE_DATE },
                { field: "name", header: AUDIT_LABELS.NAME },
                { field: "name", header: AUDIT_LABELS.INSURANCE_COMPANY },
                { field: "name", header: AUDIT_LABELS.INSURANCE_POLICY },
                { field: "updated", header: AUDIT_LABELS.INSURANCE_EXPIRATION_DATE },
                { field: "name", header: AUDIT_LABELS.TERM },
                { field: "startingballance", header: AUDIT_LABELS.PAYMENT_AMOUNT },
                { field: "startingballance", header: AUDIT_LABELS.CURRENT_DUE },
                { field: "startingballance", header: AUDIT_LABELS.NEXT_PAYMENT_DUE },
                { field: "accountstatus", header: AUDIT_LABELS.STATUS },
            ];

        case ACCOUNT_AUDIT_TYPES.MISSING_POLICIES:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "name", header: AUDIT_LABELS.NAME },
                { field: "datesold", header: AUDIT_LABELS.DATE_SOLD },
                { field: "name", header: AUDIT_LABELS.INSURANCE_COMPANY },
                { field: "name", header: AUDIT_LABELS.INSURANCE_POLICY },
                { field: "updated", header: AUDIT_LABELS.INSURANCE_EXPIRATION_DATE },
            ];

        case ACCOUNT_AUDIT_TYPES.MISSING_TITLES:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "name", header: AUDIT_LABELS.NAME },
                { field: "datesold", header: AUDIT_LABELS.DATE_SOLD },
                { field: "name", header: AUDIT_LABELS.YEAR },
                { field: "name", header: AUDIT_LABELS.MAKE },
                { field: "name", header: AUDIT_LABELS.MODEL },
                { field: "name", header: AUDIT_LABELS.VIN },
            ];

        case ACCOUNT_AUDIT_TYPES.NOTES_TAKEN_TODAY:
        case ACCOUNT_AUDIT_TYPES.NOTES_TAKEN_YESTERDAY:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "name", header: AUDIT_LABELS.NAME },
                { field: "created", header: AUDIT_LABELS.DATE_AND_TIME },
                { field: "name", header: AUDIT_LABELS.TAKEN_BY },
                { field: "name", header: AUDIT_LABELS.CONTACT_METHOD },
            ];

        case ACCOUNT_AUDIT_TYPES.PROMISES_TAKEN_TODAY:
        case ACCOUNT_AUDIT_TYPES.PROMISES_TAKEN_YESTERDAY:
            return [
                { field: "accountnumber", header: AUDIT_LABELS.ACCOUNT },
                { field: "name", header: AUDIT_LABELS.NAME },
                { field: "created", header: AUDIT_LABELS.PROMISE_DATE },
                { field: "name", header: AUDIT_LABELS.TAKEN_BY },
                { field: "accountstatus", header: AUDIT_LABELS.STATUS },
                { field: "downpayment", header: AUDIT_LABELS.PROMISE_AMOUNT },
            ];

        default:
            return [
                { field: "name", header: AUDIT_LABELS.ACCOUNT },
                { field: "accountnumber", header: AUDIT_LABELS.LINE_NUMBER },
                { field: "accounttype", header: AUDIT_LABELS.USER },
                { field: "created", header: AUDIT_LABELS.DATE },
                { field: "startingballance", header: AUDIT_LABELS.DEBIT },
                { field: "downpayment", header: AUDIT_LABELS.CREDIT },
            ];
    }
};

export const AccountsAudit = observer((): ReactElement => {
    const navigate = useNavigate();
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { showError } = useToastMessage();
    const [totalRecords] = useState<number>(0);
    const [globalSearch, setGlobalSearch] = useState<string>("");
    const [lazyState, setLazyState] = useState<DatatableQueries>(initialDataTableQueries);
    const [isLoading] = useState<boolean>(false);
    const { createReport } = useCreateReport<AuditRecord>();
    const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
    const { moduleSettings, setModuleSettings, saveColumnWidth, settingsLoaded } =
        useUserProfileSettings<AccountsAuditUserSettings, TableColumn>("accountsAudit", []);
    const [selectedAuditType, setSelectedAuditType] = useState<ACCOUNT_AUDIT_TYPES | undefined>(
        undefined
    );
    const [expandedRows, setExpandedRows] = useState<DataTableValue[]>([]);

    const currentColumns = getColumnsByAuditType(selectedAuditType);

    const getAuditRecords = async (type: ACCOUNT_AUDIT_TYPES) => {
        if (!authUser) return;
        const response = await getAccountAudit(type);
        if (Array.isArray(response)) {
            setAuditRecords(response);
        } else {
            setAuditRecords([]);
            showError(response?.error);
        }
    };

    useEffect(() => {
        if (settingsLoaded) {
            const typeToLoad =
                moduleSettings?.selectedAuditType ?? ACCOUNT_AUDIT_TYPES.ACTIVITY_FOR_TODAY;
            setSelectedAuditType(typeToLoad);
        }
    }, [settingsLoaded]);

    useEffect(() => {
        if (selectedAuditType !== undefined && authUser) {
            getAuditRecords(selectedAuditType);
        }
    }, [selectedAuditType, authUser]);

    const printTableData = async (print: boolean = false) => {
        if (!authUser) return;

        await createReport({
            userId: authUser.useruid,
            items: auditRecords,
            columns: currentColumns.map((column) => ({
                field: column.field,
                header: String(column.header),
            })),
            widths: [],
            print,
            name: "accounts-audit",
        });
    };

    const pageChanged = (event: DataTablePageEvent) => {
        setLazyState(event);
    };

    const sortData = (event: DataTableSortEvent) => {
        setLazyState(event);
    };

    const handleAuditTypeChange = (type: ACCOUNT_AUDIT_TYPES) => {
        setSelectedAuditType(type);
        setModuleSettings({ selectedAuditType: type });
    };

    const handleRowExpansion = (task: Task) => {
        setExpandedRows((prev) =>
            prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
        );
    };

    const renderRowExpansionTemplate = (data: AuditRecord) => {
        const isActivityType =
            selectedAuditType === ACCOUNT_AUDIT_TYPES.ACTIVITY_FOR_TODAY ||
            selectedAuditType === ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_7_DAYS ||
            selectedAuditType === ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_31_DAYS;

        const label = isActivityType ? "Description: " : "Note: ";

        return rowExpansionTemplate({
            text: data.notes || data.name,
            label,
            limitTextLength: 128,
        });
    };

    return (
        <div className='card-content'>
            <AuditHeader
                searchValue={globalSearch}
                onSearchChange={setGlobalSearch}
                onPrint={() => printTableData(true)}
                onDownload={() => printTableData()}
                isLoading={isLoading}
                selectedAccountType={selectedAuditType}
                onAccountTypeChange={handleAuditTypeChange}
            />
            <div className='grid'>
                <div className='col-12'>
                    {isLoading ? (
                        <div className='dashboard-loader__wrapper'>
                            <Loader overlay />
                        </div>
                    ) : (
                        <DataTable
                            key={selectedAuditType}
                            showGridlines
                            value={auditRecords}
                            lazy
                            paginator
                            first={lazyState.first}
                            rows={lazyState.rows}
                            rowsPerPageOptions={ROWS_PER_PAGE}
                            totalRecords={totalRecords || 1}
                            onPage={pageChanged}
                            onSort={sortData}
                            reorderableColumns
                            expandedRows={expandedRows}
                            rowExpansionTemplate={renderRowExpansionTemplate}
                            resizableColumns
                            sortOrder={lazyState.sortOrder}
                            sortField={lazyState.sortField}
                            rowClassName={() => "hover:text-primary cursor-pointer"}
                            onRowClick={({ data }: DataTableRowClickEvent) =>
                                navigate(ACCOUNTS_PAGE.EDIT(data.accountuid))
                            }
                            onColumnResizeEnd={(event) => {
                                if (authUser && event && event.column?.props?.field) {
                                    saveColumnWidth(
                                        event.column.props.field as string,
                                        event.element?.offsetWidth || 0
                                    );
                                }
                            }}
                        >
                            {ExpansionColumn({ handleRowExpansion })}
                            {currentColumns.map(({ field, header }) => {
                                const savedWidth = moduleSettings?.columnWidth?.[field];

                                return (
                                    <Column
                                        field={field}
                                        header={header}
                                        key={field}
                                        sortable
                                        pt={{
                                            root: {
                                                style: savedWidth
                                                    ? {
                                                          width: `${savedWidth}px`,
                                                          maxWidth: `${savedWidth}px`,
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                      }
                                                    : {
                                                          overflow: "hidden",
                                                          textOverflow: "ellipsis",
                                                      },
                                            },
                                        }}
                                    />
                                );
                            })}
                        </DataTable>
                    )}
                </div>
            </div>
        </div>
    );
});
