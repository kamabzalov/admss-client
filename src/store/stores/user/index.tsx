import { LS_APP_USER } from "common/constants/localStorage";
import { UserPermissionsResponse } from "common/models/user";
import { AuthUser } from "http/services/auth.service";
import { makeAutoObservable } from "mobx";
import { getKeyValue } from "services/local-storage.service";
import { RootStore } from "store";

class Settings {
    private _isSidebarCollapsed: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    public get isSidebarCollapsed() {
        return this._isSidebarCollapsed;
    }

    public toggleSidebar() {
        this._isSidebarCollapsed = !this._isSidebarCollapsed;
    }
}

export class UserStore {
    public rootStore: RootStore;
    private _storedUser: AuthUser | null = getKeyValue(LS_APP_USER);
    public settings: Settings = new Settings();

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get authUser() {
        return this._storedUser;
    }

    public set storedUser(user: AuthUser | null) {
        if (user) {
            const { permissions, ...restUserData } = user;
            this._storedUser = {
                ...restUserData,
                permissions: this._storedUser?.permissions || ({} as UserPermissionsResponse),
            };
        } else {
            this._storedUser = null;
        }
    }

    public set userPermissions(permissions: UserPermissionsResponse) {
        if (this._storedUser) {
            this._storedUser = { ...this._storedUser, permissions };
        }
    }
}
