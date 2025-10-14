import { SubUser } from "common/models/users";
import { Status } from "common/models/base-response";
import { getUserData } from "http/services/users";
import { makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class UsersStore {
    public rootStore: RootStore;
    private _user: SubUser | null = null;
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }
    public getCurrentUser = async (useruid: string) => {
        this._isLoading = true;
        try {
            const response = await getUserData(useruid);
            if (response && response.status === Status.ERROR) {
                await Promise.reject(response?.error);
                return;
            } else {
                this._user = response as SubUser;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
        }
    };

    public get user() {
        return this._user;
    }

    public get isLoading() {
        return this._isLoading;
    }
}
