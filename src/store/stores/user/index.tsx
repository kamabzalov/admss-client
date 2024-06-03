import { LS_APP_USER } from "common/constants/localStorage";
import { UserPermissionsResponse } from "common/models/user";
import { getUserPermissions } from "http/services/auth-user.service";
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

    public getPermissions = async () => {
        try {
            const authUser = getKeyValue(LS_APP_USER);
            const response = await getUserPermissions(authUser.useruid);
            this._storedUser!.permissions = response as UserPermissionsResponse;
        } catch (error) {}
    };
}
