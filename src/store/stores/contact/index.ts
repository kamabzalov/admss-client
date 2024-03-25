import { Status } from "common/models/base-response";
import { Contact, ExtData } from "common/models/contact";
import { getContactInfo, setContact } from "http/services/contacts-service";
import { action, makeAutoObservable, observable } from "mobx";
import { RootStore } from "store";

export class ContactStore {
    public rootStore: RootStore;
    private _contact: Contact = observable({}) as Contact;
    private _contactExtData: ExtData = {} as ExtData;
    private _contactID: string = "";
    protected _isLoading = false;
    private _frontSiteDL: File = {} as File;
    private _backSiteDL: File = {} as File;

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

    public get isLoading() {
        return this._isLoading;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public getContact = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getContactInfo(itemuid);
            if (response) {
                const contact = response;
                this._contactID = response.contactuid;
                this._contact = contact || ({} as Contact);
                this._contactExtData = contact.extdata || ({} as ExtData);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getImagesDL = async (): Promise<any> => {
        this._isLoading = true;
        try {
            return Status.OK;
        } catch (error) {
            return Status.ERROR;
        } finally {
            this._isLoading = false;
        }
    };

    public changeContact = action(
        (key: keyof Omit<Contact, "extdata">, value: string | number | string[]) => {
            this._contact[key] = value as never;
        }
    );

    public changeContactExtData = action((key: keyof ExtData, value: string | number) => {
        this._contactExtData[key] = value as never;
    });

    public saveContact = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;
            const contactData: Contact = {
                ...this.contact,
                extdata: this.contactExtData,
            };
            const inventoryResponse = await setContact(this._contactID, contactData);
            await Promise.all([inventoryResponse]).then((response) =>
                response.every((item) => item?.status === Status.OK) ? this._contactID : undefined
            );
        } catch (error) {
            // TODO: add error handlers
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public setImagesDL = async (): Promise<any> => {
        this._isLoading = true;
        try {
            return Status.OK;
        } catch (error) {
            return Status.ERROR;
        } finally {
            this._isLoading = false;
        }
    };

    public removeImagesDL = async (): Promise<any> => {
        this._isLoading = true;
        try {
            return Status.OK;
        } catch (error) {
            return Status.ERROR;
        } finally {
            this._isLoading = false;
        }
    };

    public clearContact = () => {
        this._contact = {} as Contact;
        this._backSiteDL = {} as File;
        this._frontSiteDL = {} as File;
        this._contactExtData = {} as ExtData;
    };
}
