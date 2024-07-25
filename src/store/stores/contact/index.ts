/* eslint-disable no-unused-vars */
import { getInventoryMediaItem } from "./../../../http/services/media.service";
import { BaseResponseError, Status } from "common/models/base-response";
import { Contact, ContactExtData, ContactProspect } from "common/models/contact";
import { MediaType } from "common/models/enums";
import {
    deleteContactFrontDL,
    deleteContactBackDL,
    getContactInfo,
    setContactDL,
    setContact,
} from "http/services/contacts-service";
import { createMediaItemRecord, uploadInventoryMedia } from "http/services/media.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

enum DLSides {
    FRONT = "front",
    BACK = "back",
}

export type DLSide = DLSides.FRONT | DLSides.BACK;

export class ContactStore {
    public rootStore: RootStore;
    private _contact: Contact = {} as Contact;
    private _contactExtData: ContactExtData = {} as ContactExtData;
    private _contactProspect: Partial<ContactProspect>[] = [];
    private _contactID: string = "";
    protected _isLoading = false;
    private _frontSiteDLurl: string = "";
    private _backSiteDLurl: string = "";
    private _frontSiteDL: File = {} as File;
    private _backSiteDL: File = {} as File;
    private _memoRoute: string = "";

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get contact() {
        return this._contact;
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

    public get isLoading() {
        return this._isLoading;
    }

    public get memoRoute() {
        return this._memoRoute;
    }

    public getContact = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getContactInfo(itemuid);
            if (response) {
                const { extdata, ...contact } = response as Contact;

                this._contactID = contact.contactuid;

                this._contact = contact || ({} as Contact);
                this._contactExtData = extdata || ({} as ContactExtData);
                this._contactProspect = this._contact?.prospect || [];
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getImagesDL = (): void => {
        if (this._contact.dluidfront) {
            getInventoryMediaItem(this._contact.dluidfront).then((res) => {
                if (res) {
                    this._frontSiteDLurl = res;
                }
            });
        }
        if (this._contact.dluidback) {
            getInventoryMediaItem(this._contact.dluidback).then((res) => {
                if (res) {
                    this._backSiteDLurl = res;
                }
            });
        }
    };

    public changeContact = action(
        (key: keyof Omit<Contact, "extdata">, value: string | number | string[]) => {
            this._contact[key] = value as never;
        }
    );

    public changeContactExtData = action((key: keyof ContactExtData, value: string | number) => {
        this._contactExtData[key] = value as never;
    });

    private setImagesDL = async (contactuid: string): Promise<any> => {
        this._isLoading = true;
        try {
            [this._frontSiteDL, this._backSiteDL].forEach(async (file, index) => {
                if (file.size) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const createMediaResponse = await createMediaItemRecord(MediaType.mtPhoto);
                    if (createMediaResponse?.status === Status.OK) {
                        const uploadMediaResponse = await uploadInventoryMedia(
                            createMediaResponse.itemUID,
                            formData
                        );
                        if (uploadMediaResponse?.status === Status.OK) {
                            await setContactDL(contactuid, {
                                [!index ? "dluidfront" : "dluidback"]: uploadMediaResponse.itemuid,
                            });
                        }
                    }
                }
            });
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    };

    public saveContact = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;
            let newProspect: Partial<ContactProspect>[] = [];
            if (this._contactProspect.length) {
                const prospectFirst = this._contactProspect.find(
                    (pros) => pros && pros.notes === this._contactExtData.PROSPECT1_ID
                ) || { notes: this._contactExtData.PROSPECT1_ID };
                const prospectSecond = this._contactProspect.find(
                    (pros) => pros && pros.notes === this._contactExtData.PROSPECT2_ID
                ) || { notes: this._contactExtData.PROSPECT2_ID };
                const prevProspects = this._contactProspect;

                newProspect = [...prevProspects, prospectFirst, prospectSecond].filter(Boolean);
            }

            const contactData: Contact = {
                ...this.contact,
                extdata: this.contactExtData,
                prospect: newProspect as ContactProspect[],
            };

            const [contactDataResponse, imagesResponse] = await Promise.all([
                setContact(this._contactID, contactData),
                this.setImagesDL(this._contactID),
            ]);

            if (
                contactDataResponse &&
                contactDataResponse.status === Status.OK &&
                imagesResponse.status === Status.OK
            ) {
                return Status.OK;
            }

            return Status.ERROR;
        } catch (error) {
            // TODO: add error handlers
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

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

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set memoRoute(state: string) {
        this._memoRoute = state;
    }

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

    public clearContact = () => {
        this._contact = {} as Contact;
        this._contactID = "";
        this._frontSiteDLurl = "";
        this._backSiteDLurl = "";
        this._frontSiteDL = {} as File;
        this._backSiteDL = {} as File;
        this._contactExtData = {} as ContactExtData;
    };
}
