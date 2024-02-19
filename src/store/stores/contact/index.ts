import { Contact } from "common/models/contact";
import { getContactInfo } from "http/services/contacts-service";
import { makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class ContactStore {
    public rootStore: RootStore;
    private _contact: Contact = {} as Contact;
    private _contactID: string = "";
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get contact() {
        return this._contact;
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
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public clearContact = () => {
        this._contact = {} as Contact;
    };
}
