import {
    AccountDetails,
    AccountDownPayments,
    AccountDrawer,
    AccountFeeData,
    AccountHistory,
    AccountInfo,
    AccountInsurance,
    AccountListActivity,
    AccountMemoNote,
    AccountNote,
    AccountPayment,
    AccountPromise,
    AccountUpdateTakePayment,
    AccountUpdateTotalInfo,
} from "common/models/accounts";
import { BaseResponse, BaseResponseError } from "common/models/base-response";
import { InventoryExtData } from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { ApiRequest } from "http/index";

export interface TotalAccountList extends BaseResponse {
    total: number;
}

export interface AuditRecord {
    accountName: string;
    lineNumber: string;
    user: string;
    date: string;
    debit: string;
    credit: string;
}

export interface AuditType {
    name: string;
    value: string;
}

export const getAccountsList = async (uid: string, queryParams: QueryParams) => {
    return new ApiRequest().get<AccountInfo[] | TotalAccountList>({
        url: `accounts/${uid}/list`,
        config: { params: queryParams },
        defaultError: "Error while getting user account list",
    });
};

export const getAccountAudit = async (auditid: string) => {
    return new ApiRequest().get<AuditRecord[] | BaseResponseError>({
        url: `accounts/${auditid}/audit`,
        defaultError: "Error while getting audit info",
    });
};

export const getAuditTypes = async (useruid: string) => {
    return new ApiRequest().get<AuditType[] | BaseResponseError>({
        url: `accounts/${useruid}/audittypes`,
        defaultError: "Error while getting audit types",
    });
};

export const getAccountPayment = async (itemuid: string): Promise<AccountPayment | unknown> => {
    return new ApiRequest().get<AccountPayment>({
        url: `accounts/${itemuid}/payment`,
        defaultError: "Error while getting account payment",
    });
};

export const getAccountInfo = async (itemid: string) => {
    return new ApiRequest().get<AccountInfo | BaseResponseError>({
        url: `accounts/${itemid}/info`,
        defaultError: "Error while getting account info",
    });
};

export const getAccountNote = async (accountuid: string) => {
    return new ApiRequest().get<AccountMemoNote | BaseResponseError>({
        url: `accounts/${accountuid}/note`,
        defaultError: "Error while getting account note",
    });
};

export const getAccountOriginalAmount = async (accountuid: string) => {
    return new ApiRequest().get<AccountUpdateTotalInfo | BaseResponseError>({
        url: `accounts/${accountuid}/originalamount`,
        defaultError: "Error while getting account original amount",
    });
};

export const listAccountHistory = async (accountuid: string) => {
    return new ApiRequest().get<AccountHistory[] | BaseResponseError>({
        url: `accounts/${accountuid}/listhistory`,
        defaultError: "Error while listing account history",
    });
};

export const listAccountActivity = async (accountuid: string) => {
    return new ApiRequest().get<AccountListActivity[] | BaseResponseError>({
        url: `accounts/${accountuid}/listactivity`,
        defaultError: "Error while listing account activity",
    });
};

export const listAccountDownPayments = async (accountuid: string) => {
    return new ApiRequest().get<AccountDownPayments[] | BaseResponseError>({
        url: `accounts/${accountuid}/listdownpayments`,
        defaultError: "Error while listing account down payments",
    });
};

export const listAccountPromises = async (accountuid: string) => {
    return new ApiRequest().get<AccountPromise[] | BaseResponseError>({
        url: `accounts/${accountuid}/listpromises`,
        defaultError: "Error while listing account promises",
    });
};

export const listAccountNotes = async (accountuid: string) => {
    return new ApiRequest().get<AccountNote[] | BaseResponseError>({
        url: `accounts/${accountuid}/listnotes`,
        defaultError: "Error while listing account notes",
    });
};

export const listDeletionReasons = async (useruid: string) => {
    return new ApiRequest().get({
        url: `accounts/${useruid}/listdeletionreasons`,
        defaultError: "Error while listing deletion reasons",
    });
};

export const listPaymentDrawers = async (useruid: string) => {
    return new ApiRequest().get<AccountDrawer | BaseResponseError>({
        url: `accounts/${useruid}/drawers`,
        defaultError: "Error while listing payment drawers",
    });
};

export const reportColumns = async (useruid: string) => {
    return new ApiRequest().get({
        url: `accounts/${useruid}/reportcolumns`,
        defaultError: "Error while getting report columns",
    });
};

export const listInsuranceHistory = async (accountuid: string) => {
    return new ApiRequest().get<AccountInsurance[] | BaseResponseError>({
        url: `accounts/${accountuid}/listinsurancehistory`,
        defaultError: "Error while listing insurance history",
    });
};

export const getAccountInsurance = async (accountuid: string) => {
    return new ApiRequest().get<AccountInsurance | BaseResponseError>({
        url: `accounts/${accountuid}/insurance`,
        defaultError: "Error while getting insurance",
    });
};

export const createOrUpdateAccount = async (
    id: string,
    data: Partial<AccountInfo> | Partial<InventoryExtData>
) => {
    return new ApiRequest().post({
        url: `accounts/${id}/set`,
        data,
        defaultError: "Error while creating or updating account",
    });
};

export const deleteAccount = async (id: string) => {
    return new ApiRequest().post({
        url: `accounts/${id}/delete`,
        defaultError: "Error while deleting account",
    });
};

export const setOrUpdateHistoryInfo = async (
    itemuid: string,
    historyData: Partial<AccountHistory>
) => {
    return new ApiRequest().post({
        url: `accounts/${itemuid}/history`,
        data: historyData,
        defaultError: "Error while setting or updating history info",
    });
};

export const addAccountNote = async (itemuid: string, notesData: Partial<AccountNote>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `accounts/${itemuid}/notes`,
        data: notesData,
        defaultError: "Error while updating notes info",
    });
};

export const updateAccountNote = async (itemuid: string, noteData: Partial<AccountMemoNote>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `accounts/${itemuid}/note`,
        data: noteData,
        defaultError: "Error while setting or updating note",
    });
};

export const deleteAccountNote = async (itemuid: string) => {
    return new ApiRequest().post({
        url: `accounts/${itemuid}/deletenote`,
        defaultError: "Error while deleting note",
    });
};

export const getPaymentInfo = async (accountuid: string): Promise<AccountDetails | unknown> => {
    return new ApiRequest().get<AccountDetails>({
        url: `accounts/${accountuid}/paymentinfo`,
        defaultError: "Error while getting payment info",
    });
};

export const deletePaymentInfo = async (itemuid: string) => {
    return new ApiRequest().post({
        url: `accounts/${itemuid}/deletepayment`,
        defaultError: "Error while deleting payment info",
    });
};

export const updateAccountInsurance = async (
    accountuid: string,
    insuranceData: Partial<AccountInsurance>
) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/insurance`,
        data: insuranceData,
        defaultError: "Error while updating insurance",
    });
};

export const updateAccountTotal = async (
    accountuid: string,
    totalInfo: Partial<AccountUpdateTotalInfo>
) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/updatetotal`,
        data: totalInfo,
        defaultError: "Error while updating total info",
    });
};

export const updateAccountTakePayment = async (
    accountuid: string,
    paymentInfo: Partial<AccountUpdateTakePayment>
) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/takepayment`,
        data: paymentInfo,
        defaultError: "Error while updating take payment info",
    });
};

export const addAccountFee = async (accountuid: string, feeInfo: Partial<AccountFeeData>) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/addfee`,
        data: feeInfo,
        defaultError: "Error while adding fee",
    });
};

export const checkAccountPaymentInfo = async (
    accountuid: string,
    paymentData: Partial<AccountUpdateTakePayment>
) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/checkpayment`,
        data: paymentData,
        defaultError: "Error while checking payment info",
    });
};

export const addAccountPromise = async (
    accountuid: string,
    promiseData: Partial<AccountPromise>
) => {
    return new ApiRequest().post({
        url: `accounts/${accountuid}/promiseadd`,
        data: promiseData,
        defaultError: "Error while adding promise",
    });
};

export const deleteAccountPromise = async (itemuid: string) => {
    return new ApiRequest().post({
        url: `accounts/${itemuid}/deletepromise`,
        defaultError: "Error while deleting promise",
    });
};

export const updateAccountPromise = async (
    promiseuid: string,
    promiseData: Partial<AccountPromise>
) => {
    return new ApiRequest().post({
        url: `accounts/${promiseuid}/promiseset`,
        data: promiseData,
        defaultError: "Error while updating promise",
    });
};

export const calcUserDataTotalPaid = async (
    accountuid: string,
    totalInfo: Partial<AccountUpdateTotalInfo>
) => {
    return new ApiRequest().post<AccountUpdateTotalInfo | BaseResponseError>({
        url: `accounts/${accountuid}/calcfromhistory`,
        data: totalInfo,
        defaultError: "Error while calculating user data total paid",
    });
};
