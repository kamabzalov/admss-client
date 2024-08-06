import { isAxiosError } from "axios";
import {
    AccountHistory,
    AccountInfo,
    AccountInsurance,
    AccountNote,
    AccountPayment,
} from "common/models/accounts";
import { BaseResponse, BaseResponseError } from "common/models/base-response";
import { InventoryExtData } from "common/models/inventory";
import { QueryParams } from "common/models/query-params";
import { authorizedUserApiInstance } from "http/index";
import { Status } from "common/models/base-response";

export interface TotalAccountList extends BaseResponse {
    total: number;
}

export const getAccountsList = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<any[] | TotalAccountList>(
            `accounts/${uid}/list`,
            {
                params: queryParams,
            }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting user account list",
            };
        }
    }
};

export const getAccountPayment = async (itemuid: string): Promise<AccountPayment | any> => {
    try {
        const request = await authorizedUserApiInstance.get<AccountPayment>(
            `accounts/${itemuid}/payment`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account payment",
            };
        }
    }
};

export const getAccountPaymentsList = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<AccountPayment[]>(
            `accounts/${itemuid}/payments`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting payments list",
            };
        }
    }
};

export const setAccountPayment = async (
    itemuid: string,
    accountPayment: Partial<AccountPayment> | Partial<InventoryExtData>
) => {
    try {
        const request = await authorizedUserApiInstance.post(
            `accounts/${itemuid}/payment`,
            accountPayment
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting or updating payment info",
            };
        }
    }
};

export const getAccountInfo = async (itemid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | AccountInfo>(
            `accounts/${itemid}/info`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account info",
            };
        }
    }
};

export const getAccountHistory = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${itemuid}/history`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account history",
            };
        }
    }
};

export const getAccountActivity = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${itemuid}/activity`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account activity",
            };
        }
    }
};

export const getAccountNote = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/note`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account note",
            };
        }
    }
};

export const getAccountMemo = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/memo`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account memo",
            };
        }
    }
};

export const getAccountNotes = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/notes`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting account notes",
            };
        }
    }
};

export const listAccountHistory = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | AccountHistory[]>(
            `accounts/${accountuid}/listhistory`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing account history",
            };
        }
    }
};

export const listAccountActivity = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/listactivity`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing account activity",
            };
        }
    }
};

export const listAccountPayments = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/listpayments`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing account payments",
            };
        }
    }
};

export const listAccountNotes = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | AccountNote[]>(
            `accounts/${accountuid}/listnotes`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing account notes",
            };
        }
    }
};

export const getShortInfo = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/shortinfo`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting short info",
            };
        }
    }
};

export const listDeletionReasons = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${useruid}/listdeletionreasons`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing deletion reasons",
            };
        }
    }
};

export const reportColumns = async (useruid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${useruid}/reportcolumns`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting report columns",
            };
        }
    }
};

export const getLockState = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/lock`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting lock state",
            };
        }
    }
};

export const listInsuranceHistory = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | AccountInsurance[]>(
            `accounts/${accountuid}/listinsurancehistory`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while listing insurance history",
            };
        }
    }
};

export const getAccountInsurance = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | AccountInsurance>(
            `accounts/${accountuid}/insurance`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting insurance",
            };
        }
    }
};

export const createOrUpdateAccount = async (id: string, data: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${id}/set`,
            data
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while creating or updating account",
            };
        }
    }
};

export const deleteAccount = async (id: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${id}/delete`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting account",
            };
        }
    }
};

export const undeleteAccount = async (id: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${id}/undelete`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while undeleting account",
            };
        }
    }
};

export const updateAccountStatus = async (id: string, status: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${id}/status`,
            { status }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while updating account status",
            };
        }
    }
};

export const setOrUpdateHistoryInfo = async (itemuid: string, historyData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/history`,
            historyData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting or updating history info",
            };
        }
    }
};

export const setOrUpdateActivityInfo = async (itemuid: string, activityData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/activity`,
            activityData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error:
                    error.response?.data.error || "Error while setting or updating activity info",
            };
        }
    }
};

export const setOrUpdateNotesInfo = async (itemuid: string, notesData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/notes`,
            notesData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting or updating notes info",
            };
        }
    }
};

export const setOrUpdateNote = async (itemuid: string, noteData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/note`,
            noteData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting or updating note",
            };
        }
    }
};

export const setOrUpdateMemo = async (itemuid: string, memoData: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/memo`,
            memoData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting or updating memo",
            };
        }
    }
};

export const deleteHistoryInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/deletehistory`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting history info",
            };
        }
    }
};

export const undeleteHistoryInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/undeletehistory`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while undeleting history info",
            };
        }
    }
};

export const deleteActivityInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/deleteactivity`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting activity info",
            };
        }
    }
};

export const undeleteActivityInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/undeleteactivity`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while undeleting activity info",
            };
        }
    }
};

export const deleteNote = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/deletenote`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting note",
            };
        }
    }
};

export const undeleteNote = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/undeletenote`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while undeleting note",
            };
        }
    }
};

export const getPaymentInfo = async (accountuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<BaseResponseError | undefined>(
            `accounts/${accountuid}/paymentinfo`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while getting payment info",
            };
        }
    }
};

export const deletePaymentInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/deletepayment`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while deleting payment info",
            };
        }
    }
};

export const undeletePaymentInfo = async (itemuid: string) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${itemuid}/undeletepayment`
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while undeleting payment info",
            };
        }
    }
};

export const setLockState = async (accountuid: string, lockState: any) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${accountuid}/lock`,
            { lockState }
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while setting lock state",
            };
        }
    }
};

export const updateAccountInsurance = async (
    accountuid: string,
    insuranceData: AccountInsurance
) => {
    try {
        const request = await authorizedUserApiInstance.post<BaseResponseError | undefined>(
            `accounts/${accountuid}/insurance`,
            insuranceData
        );
        return request.data;
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error while updating insurance",
            };
        }
    }
};
