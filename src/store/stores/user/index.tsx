import { LS_APP_USER } from "common/constants/localStorage";
import { UserPermissionsResponse } from "common/models/user";
import { AuthUser } from "http/services/auth.service";
import { makeAutoObservable } from "mobx";
import { getKeyValue } from "services/local-storage.service";
import { RootStore } from "store";

export class UserStore {
    public rootStore: RootStore;
    private _storedUser: AuthUser | null = getKeyValue(LS_APP_USER);

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get authUser() {
        return this._storedUser;
    }

    public set userPermissions(permissions: UserPermissionsResponse) {
        if (this._storedUser) {
            this._storedUser = { ...this._storedUser, permissions };
        }
    }
}
