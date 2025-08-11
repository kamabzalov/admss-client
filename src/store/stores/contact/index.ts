import { getInventoryMediaItem } from "http/services/media.service";
import { BaseResponseError, Status } from "common/models/base-response";
import {
    Contact,
    ContactExtData,
    ContactMediaItem,
    ContactOFAC,
    ContactProspect,
    ContactType,
} from "common/models/contact";
import { MediaType } from "common/models/enums";
import {
    CreateMediaItemRecordResponse,
    InventorySetResponse,
    UploadMediaItem,
    InventoryMedia,
} from "common/models/inventory";
import {
    deleteContactFrontDL,
    deleteContactBackDL,
    getContactInfo,
    setContactDL,
    setContact,
    getContactMediaItemList,
    getContactMediaItem,
    uploadContactMedia,
    deleteContactMedia,
    setContactMediaItemData,
} from "http/services/contacts-service";
import { createMediaItemRecord, uploadInventoryMedia } from "http/services/media.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";
import { filterPostPayload } from "common/utils";

enum DLSides {
    FRONT = "front",
    BACK = "back",
}

export type DLSide = DLSides.FRONT | DLSides.BACK;

const initialMediaItem: UploadMediaItem = {
    file: [],
    data: {
        contenttype: MediaType.mtUnknown,
        notes: "",
    },
};

export class ContactStore {
    public rootStore: RootStore;
    private _contact: Contact = { type: 0 } as Contact;
    private _changedContactFields: (keyof Contact)[] = [];
    private _coBayerContact: Contact = { type: 0 } as Contact;
    private _changedCoBayerContactFields: (keyof Contact)[] = [];
    private _contactTypeList: ContactType[] = [];
    private _contactType: number = 0;
    private _contactExtData: ContactExtData = {} as ContactExtData;
    private _changedContactExtDataFields: (keyof ContactExtData)[] = [];
    private _contactProspect: Partial<ContactProspect>[] = [];
    private _contactID: string = "";
    private _contactOFAC: ContactOFAC = {} as ContactOFAC;
    private _coBuyerContactOFAC: ContactOFAC = {} as ContactOFAC;
    protected _isLoading = false;
    private _frontSiteDLurl: string = "";
    private _backSiteDLurl: string = "";
    private _frontSiteDL: File = {} as File;
    private _backSiteDL: File = {} as File;
    private _coBuyerFrontSideDL: File = {} as File;
    private _coBuyerBackSideDL: File = {} as File;
    private _coBuyerFrontSideDLurl: string = "";
    private _coBuyerBackSideDLurl: string = "";
    private _isContactChanged: boolean = false;
    private _memoRoute: string = "";
    private _deleteReason: string = "";
    private _activeTab: number | null = null;
    private _tabLength: number = 0;

    private _contactDocumentsID: Partial<InventoryMedia>[] = [];
    private _uploadFileDocuments: UploadMediaItem = initialMediaItem;
    private _documents: Partial<ContactMediaItem>[] = [];
    private _formErrorMessage: string = "";

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get contact() {
        return this._contact;
    }

    public get coBuyerContact() {
        return this._coBayerContact;
    }

    public get contactType() {
        return this._contactType;
    }

    public get contactTypeList() {
        return this._contactTypeList;
    }

    public get contactExtData() {
        return this._contactExtData;
    }

    public get frontSideDL() {
        return this._frontSiteDL;
    }

    public get backSideDL() {
        return this._backSiteDL;
    }

    public get frontSideDLurl() {
        return this._frontSiteDLurl;
    }

    public get backSideDLurl() {
        return this._backSiteDLurl;
    }

    public get coBuyerFrontSideDL() {
        return this._coBuyerFrontSideDL;
    }

    public get coBuyerBackSideDL() {
        return this._coBuyerBackSideDL;
    }

    public get coBuyerFrontSideDLurl() {
        return this._coBuyerFrontSideDLurl;
    }

    public get coBuyerBackSideDLurl() {
        return this._coBuyerBackSideDLurl;
    }

    public get isContactChanged() {
        return this._isContactChanged;
    }

    public get contactOFAC() {
        return this._contactOFAC;
    }

    public get coBuyerContactOFAC() {
        return this._coBuyerContactOFAC;
    }

    public get deleteReason() {
        return this._deleteReason;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public get memoRoute() {
        return this._memoRoute;
    }

    public get tabLength() {
        return this._tabLength;
    }

    public get activeTab() {
        return this._activeTab;
    }

    public get contactFullInfo() {
        return {
            ...this._contact,
            extdata: this.contactExtData,
        };
    }

    public get documents() {
        return this._documents;
    }

    public get uploadFileDocuments() {
        return this._uploadFileDocuments;
    }

    public get formErrorMessage() {
        return this._formErrorMessage;
    }

    public get isCoBuyerFieldsFilled() {
        if (
            this._contactExtData.CoBuyer_Emp_Company &&
            typeof this._contactExtData.CoBuyer_Emp_Company === "string" &&
            this._contactExtData.CoBuyer_Emp_Company.trim()
        ) {
            return false;
        }

        const nameFields = [
            this._contactExtData.CoBuyer_First_Name,
            this._contactExtData.CoBuyer_Middle_Name,
            this._contactExtData.CoBuyer_Last_Name,
        ];

        if (nameFields.some((field) => field && typeof field === "string" && field.trim())) {
            return true;
        }

        const otherTabFields = [
            this._contactExtData.CoBuyer_Res_Address,
            this._contactExtData.CoBuyer_State,
            this._contactExtData.CoBuyer_City,
            this._contactExtData.CoBuyer_Zip_Code,
            this._contactExtData.CoBuyer_Mailing_Address,
            this._contactExtData.CoBuyer_Mailing_State,
            this._contactExtData.CoBuyer_Mailing_City,
            this._contactExtData.CoBuyer_Mailing_Zip,
            this._contactExtData.CoBuyer_DL_State,
            this._contactExtData.CoBuyer_Driver_License_Num,
            this._contactExtData.CoBuyer_DL_Exp_Date,
            this._contactExtData.CoBuyer_SS_Number,
            this._contactExtData.CoBuyer_Date_Of_Birth,
            this._contactExtData.CoBuyer_Sex,
        ];

        return otherTabFields.some((field) => field && typeof field === "string" && field.trim());
    }

    public getContact = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getContactInfo(itemuid);
            if (response && response.status === Status.ERROR) {
                await Promise.reject(response?.error);
                return;
            } else {
                const { extdata, ...contact } = response as Contact;

                this._contactID = contact.contactuid;
                this.contactType = contact.type;
                this._contact = contact || ({} as Contact);
                this._contactExtData = extdata || ({} as ContactExtData);
                this._contactProspect = this._contact?.prospect || [];
            }
            if (this._contact.cobuyeruid) await this.getCoBuyerContact();
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
        }
    };

    public getCoBuyerContact = async () => {
        if (!this._contact.cobuyeruid) return;
        try {
            const response = await getContactInfo(this._contact.cobuyeruid);
            if (response?.status === Status.ERROR) {
                await Promise.reject(response?.error);
                return;
            }
            this._coBayerContact = response as Contact;
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    public getImagesDL = (isCoBuyer?: boolean): void => {
        const uid = isCoBuyer ? this._contact.cobuyeruid : this._contactID;
        if (!uid) return;

        if (isCoBuyer) {
            if (this._coBayerContact.dluidfront) {
                getInventoryMediaItem(this._coBayerContact.dluidfront).then((res) => {
                    if (res) this._coBuyerFrontSideDLurl = res;
                });
            }
            if (this._coBayerContact.dluidback) {
                getInventoryMediaItem(this._coBayerContact.dluidback).then((res) => {
                    if (res) this._coBuyerBackSideDLurl = res;
                });
            }
            return;
        }

        if (this._contact.dluidfront) {
            getInventoryMediaItem(this._contact.dluidfront).then((res) => {
                if (res) this._frontSiteDLurl = res;
            });
        }
        if (this._contact.dluidback) {
            getInventoryMediaItem(this._contact.dluidback).then((res) => {
                if (res) this._backSiteDLurl = res;
            });
        }
    };

    public changeContact = action(
        (
            keyOrEntries:
                | keyof Omit<Contact, "extdata">
                | [keyof Omit<Contact, "extdata">, string | number][],
            value?: string | number | undefined,
            isContactChanged: boolean = true
        ) => {
            if (value === undefined) value = "";
            const pushToChangedFields = (key: keyof Omit<Contact, "extdata">) => {
                if (!this._changedContactFields.includes(key)) {
                    this._changedContactFields.push(key);
                }
            };
            if (isContactChanged) {
                this._isContactChanged = true;
            }
            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    pushToChangedFields(key);
                    this._contact[key] = val as never;
                });
            } else {
                pushToChangedFields(keyOrEntries);
                this._contact[keyOrEntries] = value as never;
            }
        }
    );

    public changeCobuyerContact = action(
        (key: keyof Omit<Contact, "extdata">, value: string | number | string[]) => {
            const pushToChangedFields = (key: keyof Omit<Contact, "extdata">) => {
                if (!this._changedCoBayerContactFields.includes(key)) {
                    this._changedCoBayerContactFields.push(key);
                }
            };
            if (value === undefined) value = "";
            pushToChangedFields(key);
            return (this._coBayerContact[key] = value as never);
        }
    );

    public changeContactExtData = action(
        (
            keyOrEntries: keyof ContactExtData | [keyof ContactExtData, string | number][],
            value?: string | number
        ) => {
            const pushToChangedFields = (key: keyof ContactExtData) => {
                if (!this._changedContactExtDataFields.includes(key)) {
                    this._changedContactExtDataFields.push(key);
                }
            };
            if (value === undefined) value = "";
            this._isContactChanged = true;

            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    pushToChangedFields(key);
                    this._contactExtData[key] = val as never;
                });
            } else {
                pushToChangedFields(keyOrEntries);
                this._contactExtData[keyOrEntries] = value as never;
            }
        }
    );

    public saveContact = action(async (): Promise<BaseResponseError> => {
        try {
            this._isLoading = true;

            let newProspect: Partial<ContactProspect>[] = [];
            if (this._contactProspect.length) {
                const prospectFirst = this._contactProspect.find(
                    (pros) => pros?.notes === this._contactExtData.PROSPECT1_ID
                ) || { notes: this._contactExtData.PROSPECT1_ID };
                const prospectSecond = this._contactProspect.find(
                    (pros) => pros?.notes === this._contactExtData.PROSPECT2_ID
                ) || { notes: this._contactExtData.PROSPECT2_ID };
                newProspect = [...this._contactProspect, prospectFirst, prospectSecond].filter(
                    Boolean
                );
            }

            const filteredContact = filterPostPayload(this.contact, {
                includeKeys: this._changedContactFields,
            });

            const filteredExtData = filterPostPayload(this.contactExtData, {
                excludeKeys: ["useruid"],
                includeKeys: this._changedContactExtDataFields,
            });

            const contactData: Contact = {
                ...filteredContact,
                extdata: filteredExtData,
                prospect: newProspect as ContactProspect[],
            };

            const [contactDataResponse] = await Promise.all([
                setContact(this._contactID, contactData),
                this._frontSiteDL.size || this._backSiteDL.size
                    ? this.setImagesDL(this._contactID)
                    : Promise.resolve(),
            ]);

            if (contactDataResponse?.status === Status.ERROR) {
                await Promise.reject(contactDataResponse?.error);
                return contactDataResponse;
            }

            if (this._contact.cobuyeruid) {
                const filteredCoBuyerContact = filterPostPayload(this.coBuyerContact, {
                    includeKeys: this._changedCoBayerContactFields,
                });

                const filteredCoBuyerExtData = filterPostPayload(this.contactExtData, {
                    excludeKeys: ["useruid"],
                    includeKeys: this._changedContactExtDataFields,
                });

                const coBuyerContactData: Contact = {
                    ...filteredCoBuyerContact,
                    extdata: filteredCoBuyerExtData,
                };

                const [coBuyerContactDataResponse] = await Promise.all([
                    setContact(this._contact.cobuyeruid, coBuyerContactData),
                    this._coBuyerFrontSideDL.size || this._coBuyerBackSideDL.size
                        ? this.setCoBuyerImagesDL(this._contact.cobuyeruid)
                        : Promise.resolve(),
                ]);

                if (coBuyerContactDataResponse?.status === Status.ERROR) {
                    await Promise.reject(coBuyerContactDataResponse?.error);
                    return coBuyerContactDataResponse;
                }
            }

            return { status: Status.OK };
        } catch (error) {
            return error as BaseResponseError;
        } finally {
            this._isLoading = false;
        }
    });

    private setImagesDL = async (contactuid: string): Promise<any> => {
        this._isLoading = true;
        try {
            const filesToUpload = [this._frontSiteDL, this._backSiteDL];
            for (let index = 0; index < filesToUpload.length; index++) {
                const file = filesToUpload[index];
                if (file.size) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const createMediaResponse = await createMediaItemRecord(MediaType.mtPhoto);
                    const { itemUID } = createMediaResponse as CreateMediaItemRecordResponse;
                    if (createMediaResponse?.status === Status.OK) {
                        const uploadMediaResponse = await uploadInventoryMedia(itemUID, formData);
                        const { itemuid } = uploadMediaResponse as InventorySetResponse;
                        if (uploadMediaResponse?.status === Status.OK) {
                            await setContactDL(contactuid, {
                                [!index ? "dluidfront" : "dluidback"]: itemuid,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    private setCoBuyerImagesDL = async (contactuid: string): Promise<any> => {
        this._isLoading = true;
        try {
            const filesToUpload = [this._coBuyerFrontSideDL, this._coBuyerBackSideDL];
            for (let index = 0; index < filesToUpload.length; index++) {
                const file = filesToUpload[index];
                if (file.size) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const createMediaResponse = await createMediaItemRecord(MediaType.mtPhoto);
                    const { itemUID } = createMediaResponse as CreateMediaItemRecordResponse;
                    if (createMediaResponse?.status === Status.OK) {
                        const uploadMediaResponse = await uploadInventoryMedia(itemUID, formData);
                        const { itemuid } = uploadMediaResponse as InventorySetResponse;
                        if (uploadMediaResponse?.status === Status.OK) {
                            await setContactDL(contactuid, {
                                [!index ? "dluidfront" : "dluidback"]: itemuid,
                            });
                        }
                    }
                }
            }
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    public removeImagesDL = async (side: DLSide): Promise<any> => {
        this._isLoading = true;
        try {
            if (side === DLSides.FRONT) {
                const response = await deleteContactFrontDL(this._contactID);
                if (response?.status === Status.ERROR) {
                    const { error, status } = response as BaseResponseError;
                    return { status, error };
                }
                this._frontSiteDLurl = "";
            }

            if (side === DLSides.BACK) {
                const response = await deleteContactBackDL(this._contactID);
                if (response?.status === Status.ERROR) {
                    const { error, status } = response as BaseResponseError;
                    return { status, error };
                }
                this._backSiteDLurl = "";
            }

            return Status.OK;
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    public removeCoBuyerImagesDL = async (side: DLSide): Promise<any> => {
        this._isLoading = true;
        try {
            if (side === DLSides.FRONT) {
                const response = await deleteContactFrontDL(this._coBayerContact.contactuid);
                if (response?.status === Status.ERROR) {
                    const { error, status } = response as BaseResponseError;
                    return { status, error };
                }
                this._coBuyerFrontSideDLurl = "";
            }

            if (side === DLSides.BACK) {
                const response = await deleteContactFrontDL(this._coBayerContact.contactuid);
                if (response?.status === Status.ERROR) {
                    const { error, status } = response as BaseResponseError;
                    return { status, error };
                }
                this._coBuyerBackSideDLurl = "";
            }

            return Status.OK;
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    private getContactMedia = async (): Promise<Status> => {
        try {
            const mediaList = await getContactMediaItemList(this._contactID);
            if (mediaList) {
                (mediaList as InventoryMedia[]).forEach((media) => {
                    if (media.type === MediaType.mtPhoto || media.type === MediaType.mtDocument) {
                        this._contactDocumentsID.push(media);
                    }
                });
            }
            return Status.OK;
        } catch (error) {
            return Status.ERROR;
        }
    };

    private async fetchContactMedia(
        mediaType: MediaType,
        mediaArray: Partial<ContactMediaItem>[],
        contactMediaID: Partial<InventoryMedia>[]
    ) {
        try {
            const result: Partial<ContactMediaItem>[] = [...mediaArray];
            await Promise.all(
                contactMediaID.map(async ({ mediauid, itemuid }, index: number) => {
                    if (mediauid && itemuid) {
                        const responseSrc = await getContactMediaItem(mediauid);
                        if (responseSrc) {
                            const originalMediaData = this._contactDocumentsID[index];
                            result[index] = {
                                src: responseSrc as string,
                                itemuid,
                                mediauid,
                                ...originalMediaData,
                            };
                        }
                    }
                })
            );

            if (mediaType === MediaType.mtPhoto || mediaType === MediaType.mtDocument) {
                this._documents = result;
            }
        } catch (error) {
            return { status: Status.ERROR, error };
        }
    }

    public fetchDocuments = action(async () => {
        this._documents = [];
        this._contactDocumentsID = [];
        await this.getContactMedia();
        await this.fetchContactMedia(
            MediaType.mtDocument,
            this._documents,
            this._contactDocumentsID
        );
    });

    private saveContactMedia = action(
        async (): Promise<{ status: Status; savedItems?: Partial<ContactMediaItem>[] }> => {
            try {
                const { file, data } = this._uploadFileDocuments;
                if (!file.length) {
                    return { status: Status.ERROR };
                }

                const savedItems: Partial<ContactMediaItem>[] = [];
                const uploadPromises = file.map(async (file) => {
                    const formData = new FormData();
                    formData.append("file", file);

                    try {
                        const isPdf =
                            file.type === "application/pdf" ||
                            file.name?.toLowerCase().includes(".pdf");
                        const fileMediaType = isPdf ? MediaType.mtDocument : MediaType.mtPhoto;

                        const createMediaResponse = (await createMediaItemRecord(
                            fileMediaType
                        )) as CreateMediaItemRecordResponse;
                        if (createMediaResponse?.status === Status.OK) {
                            const uploadMediaResponse = (await uploadContactMedia(
                                createMediaResponse.itemUID,
                                formData
                            )) as InventorySetResponse;
                            if (uploadMediaResponse?.status === Status.OK) {
                                const mediaDataResponse = await setContactMediaItemData(
                                    this._contactID,
                                    {
                                        mediaitemuid: uploadMediaResponse.itemuid,
                                        contenttype: data.contenttype,
                                        notes: data.notes,
                                        type: fileMediaType,
                                    }
                                );

                                if (mediaDataResponse?.status === Status.ERROR) {
                                    const { error } = mediaDataResponse as BaseResponseError;
                                    this._formErrorMessage = error || "Failed to upload file";
                                } else {
                                    const savedItem: Partial<ContactMediaItem> = {
                                        itemuid: uploadMediaResponse.itemuid,
                                        mediauid: uploadMediaResponse.itemuid,
                                        notes: data.notes,
                                    };
                                    savedItems.push(savedItem);
                                }
                            }
                        }
                    } finally {
                        this._isLoading = false;
                        this._formErrorMessage = "";
                    }
                });

                await Promise.all(uploadPromises);

                return { status: Status.OK, savedItems };
            } catch (error) {
                return { status: Status.ERROR };
            } finally {
                this._isLoading = false;
            }
        }
    );

    public saveContactDocuments = action(async (): Promise<Status | undefined> => {
        try {
            const { status, savedItems } = await this.saveContactMedia();
            if (status === Status.OK) {
                this._uploadFileDocuments = initialMediaItem;
                if (savedItems) {
                    this._documents = [...this._documents, ...savedItems];
                }
            }
            return status;
        } catch (error) {
            return undefined;
        }
    });

    public removeContactMedia = action(
        async (mediauid: string, cb?: () => void): Promise<Status | undefined> => {
            try {
                await deleteContactMedia(mediauid);

                await cb?.();

                return Status.OK;
            } catch (error) {
                return undefined;
            }
        }
    );

    public set contactType(state: number) {
        this._contactType = state;
    }

    public set frontSideDL(file: File) {
        this._frontSiteDL = file;
    }

    public set backSideDL(file: File) {
        this._backSiteDL = file;
    }

    public set frontSideDLurl(url: string) {
        this._frontSiteDLurl = url;
    }

    public set backSideDLurl(url: string) {
        this._backSiteDLurl = url;
    }

    public set coBuyerFrontSideDL(file: File) {
        this._coBuyerFrontSideDL = file;
    }

    public set coBuyerBackSideDL(file: File) {
        this._coBuyerBackSideDL = file;
    }

    public set coBuyerFrontSideDLurl(url: string) {
        this._coBuyerFrontSideDLurl = url;
    }

    public set coBuyerBackSideDLurl(url: string) {
        this._coBuyerBackSideDLurl = url;
    }

    public set contactOFAC(state: ContactOFAC) {
        this._contactOFAC = state;
    }

    public set coBuyerContactOFAC(state: ContactOFAC) {
        this._coBuyerContactOFAC = state;
    }

    public set deleteReason(state: string) {
        this._deleteReason = state;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set memoRoute(state: string) {
        this._memoRoute = state;
    }

    public set tabLength(state: number) {
        this._tabLength = state;
    }

    public set activeTab(state: number | null) {
        this._activeTab = state;
    }

    public set isContactChanged(state: boolean) {
        this._isContactChanged = state;
    }

    public set uploadFileDocuments(files: UploadMediaItem) {
        this._uploadFileDocuments = files;
    }

    public clearContactMedia = () => {
        this._documents = [];
        this._contactDocumentsID = [];
        this._uploadFileDocuments = initialMediaItem;
        this._formErrorMessage = "";
    };

    public clearContact = () => {
        this._contact = {} as Contact;
        this._coBayerContact = {} as Contact;
        this._isContactChanged = false;
        this._contactID = "";
        this._contactType = 0;
        this._frontSiteDLurl = "";
        this._backSiteDLurl = "";
        this._coBuyerFrontSideDLurl = "";
        this._coBuyerBackSideDLurl = "";
        this._frontSiteDL = {} as File;
        this._backSiteDL = {} as File;
        this._coBuyerFrontSideDL = {} as File;
        this._coBuyerBackSideDL = {} as File;
        this._contactExtData = {} as ContactExtData;
        this._contactOFAC = {} as ContactOFAC;
        this._coBuyerContactOFAC = {} as ContactOFAC;
        this._deleteReason = "";
    };
}
