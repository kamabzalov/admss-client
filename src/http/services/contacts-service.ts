import { ApiRequest } from "../index";
import { QueryParams } from "common/models/query-params";
import {
    Contact,
    ContactUser,
    ContactsCategories,
    SalespersonsList,
    ScanBarcodeDL,
    SetContactResponse,
    TotalUsers,
} from "common/models/contact";
import { BaseResponseError } from "common/models/base-response";
import { ListData } from "common/models";
import {
    InventoryMedia,
    InventoryMediaPostData,
    InventorySetResponse,
} from "common/models/inventory";

export const getContacts = async (
    uid: string,
    queryParams?: QueryParams
): Promise<ContactUser[] | BaseResponseError | undefined> => {
    return new ApiRequest().get<ContactUser[]>({
        url: `contacts/${uid}/list`,
        config: { params: queryParams },
        defaultError: "Error while getting contacts list",
    });
};

export const getContactsAmount = async (
    uid: string,
    queryParams: QueryParams
): Promise<TotalUsers | undefined> => {
    return new ApiRequest().get<TotalUsers>({
        url: `contacts/${uid}/list`,
        config: { params: queryParams },
        defaultError: "Error while getting contacts amount",
        returnErrorObject: false,
    }) as Promise<TotalUsers | undefined>;
};

export const getContactInfo = async (uid: string) => {
    return new ApiRequest().get<Contact>({
        url: `contacts/${uid}/info`,
        defaultError: "Error while getting contact info",
    });
};

export const getContactsTypeList = async (uid?: string) => {
    const response = await new ApiRequest().get<ContactsCategories>({
        url: `contacts/${uid || "0"}/listtypes`,
        defaultError: "Error on get contacts type list",
    });

    if (response && "contact_types" in response) {
        return response.contact_types;
    }

    return undefined;
};

export const getContactDeleteReasonsList = async (uid: string | "0") => {
    return new ApiRequest().get<ListData[]>({
        url: `contacts/${uid}/listdeletionreasons`,
        defaultError: "Error while getting contact delete reasons",
    });
};

export const getContactsSalesmanList = async (uid: string) => {
    return new ApiRequest().get<SalespersonsList[] | BaseResponseError>({
        url: `user/${uid}/salespersons`,
        defaultError: "Error while getting contacts salesman list",
    });
};

export const createContact = async (
    contactData: Partial<Contact>
): Promise<SetContactResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<SetContactResponse>({
        url: `contacts/0/set`,
        data: contactData,
        defaultError: "Error while creating contact",
    });
};

export const updateContact = async (
    contactuid: string,
    contactData: Partial<Contact>
): Promise<SetContactResponse | BaseResponseError | undefined> => {
    return new ApiRequest().post<SetContactResponse>({
        url: `contacts/${contactuid}/set`,
        data: contactData,
        defaultError: "Error while updating contact",
    });
};

export const setContactDL = async (
    contactuid: string,
    { dluidback, dluidfront }: { dluidfront?: string; dluidback?: string }
) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${contactuid}/dlicense`,
        data: {
            dluidfront,
            dluidback,
            contactuid,
        },
        defaultError: "Error while setting contact driver license",
        returnErrorObject: false,
    });
};

export const getContactsProspectList = async (contactuid: string) => {
    return new ApiRequest().get<unknown[] | BaseResponseError>({
        url: `contacts/${contactuid}/listprospect`,
        defaultError: "Error while getting contacts prospect list",
        returnErrorObject: false,
    });
};

export const deleteContact = async (contactuid: string, data: Record<string, string>) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${contactuid}/delete`,
        data,
        defaultError: "Error while deleting contact",
    });
};

export const deleteContactFrontDL = async (contactuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${contactuid}/deletedlicensefront`,
        defaultError: "Error while deleting contact front driver license",
    });
};

export const deleteContactBackDL = async (contactuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${contactuid}/deletedlicenseback`,
        defaultError: "Error while deleting contact back driver license",
    });
};

export const getContactMediaItemList = async (
    contactID: string
): Promise<InventoryMedia[] | BaseResponseError | undefined> => {
    return new ApiRequest().get<InventoryMedia[]>({
        url: `contacts/${contactID}/media`,
        defaultError: "Error while getting contact media item list",
    });
};

export const getContactMediaItem = async (
    mediaID: string
): Promise<string | BaseResponseError | undefined> => {
    const response = await new ApiRequest().get<Blob>({
        url: `media/${mediaID}/media`,
        config: { responseType: "blob" },
        defaultError: "Error while getting contact media item",
        returnErrorObject: false,
    });

    if (response) {
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new window.FileReader();
            reader.addEventListener("load", (event) => {
                resolve(event.target?.result as string);
            });
            reader.readAsDataURL(response as Blob);
        });

        return dataUrl;
    }

    return undefined;
};

export const uploadContactMedia = async (contactUid: string, contactData: FormData) => {
    return new ApiRequest().post<InventorySetResponse>({
        url: `media/${contactUid || 0}/media`,
        data: contactData,
        config: { headers: { "Content-Type": "multipart/form-data" } },
        defaultError: "Error while uploading contact media",
        returnErrorObject: false,
    });
};

export const setContactMediaItemData = async (
    contactUid: string,
    {
        mediaitemuid,
        notes,
        itemuid,
        order,
        mediaurl,
        contenttype,
        useruid,
        type,
    }: Partial<InventoryMediaPostData>
) => {
    const id = contactUid ? contactUid : 0;
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${id}/media`,
        data: {
            mediaitemuid,
            mediaurl,
            useruid,
            itemuid,
            contenttype,
            notes,
            order,
            type,
        },
        defaultError: "Error while setting contact media item data",
        returnErrorObject: false,
    });
};

export const deleteContactMedia = async (itemuid: string) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${itemuid}/deletemedia`,
        defaultError: "Error while deleting contact media",
    });
};

export const checkContactOFAC = async (contactuid: string = "0", contact: Contact) => {
    return new ApiRequest().post<BaseResponseError>({
        url: `contacts/${contactuid}/check`,
        data: { ...contact },
        defaultError: "Error while checking contact OFAC",
    });
};

export const scanContactDL = async (dlImage: File) => {
    const formData = new FormData();
    formData.append("dlImage", dlImage);

    return new ApiRequest().post<ScanBarcodeDL>({
        url: "decoder/dlbarcode",
        data: formData,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
        defaultError: "Error while scanning contact driver license",
        returnErrorObject: false,
    });
};
