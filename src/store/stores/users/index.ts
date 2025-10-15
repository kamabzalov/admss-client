import { SubUser, UserData } from "common/models/users";
import { Status } from "common/models/base-response";
import { getUserData } from "http/services/users";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

const initialUserData: Partial<UserData> = {
    firstName: "",
    lastName: "",
    loginName: "",
    email1: "",
    phone1: "",
};

export class UsersStore {
    public rootStore: RootStore;
    private _user: Partial<UserData> = initialUserData;
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

    public changeUserData = action(
        (
            keyOrEntries: keyof UserData | [keyof UserData, string | number][],
            value?: string | number | undefined
        ) => {
            if (value === undefined) value = "";

            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    this._user[key] = val as never;
                });
            } else {
                this._user[keyOrEntries] = value as never;
            }
        }
    );

    public get user() {
        return this._user;
    }

    public get isLoading() {
        return this._isLoading;
    }
}
