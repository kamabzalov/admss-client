import { authorizedUserApiInstance } from "../index";
import { QueryParams } from "common/models/query-params";
import {
    Contact,
    ContactUser,
    ContactsCategories,
    SalespersonsList,
    TotalUsers,
} from "common/models/contact";
import { BaseResponse, BaseResponseError, Status } from "common/models/base-response";
import { isAxiosError } from "axios";

export const getContacts = async (uid: string, queryParams?: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<ContactUser[]>(`contacts/${uid}/list`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getContactsAmount = async (uid: string, queryParams: QueryParams) => {
    try {
        const request = await authorizedUserApiInstance.get<TotalUsers>(`contacts/${uid}/list`, {
            params: queryParams,
        });
        return request.data;
    } catch (error) {
        // TODO: add error handler
    }
};

export const getContactInfo = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<Contact>(`contacts/${uid}/info`);
        if (request.data.status === Status.OK) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const getContactsTypeList = async (uid: string | "0") => {
    try {
        const request = await authorizedUserApiInstance.get<ContactsCategories>(
            `contacts/${uid}/listtypes`
        );
        if (request.data.status === Status.OK) {
            return request.data.contact_types;
        }
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error || "Error on get contacts type list",
            };
        }
    }
};

export const getContactsSalesmanList = async (uid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<SalespersonsList[]>(
            `user/${uid}/salespersons`
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const setContact = async (
    contactuid: string | null,
    contactData: Partial<Contact>
): Promise<BaseResponse | undefined> => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `contacts/${contactuid || 0}/set`,
            contactData
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const setContactDL = async (
    contactuid: string,
    { dluidback, dluidfront }: { dluidfront?: string; dluidback?: string }
) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `contacts/${contactuid}/dlicense`,
            {
                dluidfront,
                dluidback,
                contactuid,
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        // TODO: add error handler
    }
};

export const getContactsProspectList = async (contactuid: string) => {
    try {
        const request = await authorizedUserApiInstance.get<unknown[] | BaseResponseError>(
            `contacts/${contactuid}/listprospect`
        );
        if (request.status === 200) {
            return request.data;
        }
    } catch (error: Error | BaseResponseError | unknown) {
        const errorMessage = "Error while getting contacts prospect list";
        if (error instanceof Error) {
            return {
                status: Status.ERROR,
                error: error.message || errorMessage,
            };
        }
        return {
            status: Status.ERROR,
            error: error || errorMessage,
        };
    }
};

export const deleteContactFrontDL = async (contactuid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `contacts/${contactuid}/deletedlicensefront`
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error,
            };
        }
    }
};

export const deleteContactBackDL = async (contactuid: string) => {
    try {
        const response = await authorizedUserApiInstance.post<BaseResponse>(
            `contacts/${contactuid}/deletedlicenseback`
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        if (isAxiosError(error)) {
            return {
                status: Status.ERROR,
                error: error.response?.data.error,
            };
        }
    }
};

