import { LS_APP_USER } from "common/constants/localStorage";
import { UserPermissionsResponse } from "common/models/user";
import { AuthUser } from "http/services/auth.service";
import { makeAutoObservable } from "mobx";
import { getKeyValue, setKey } from "services/local-storage.service";
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

    public set isSidebarCollapsed(value: boolean) {
        this._isSidebarCollapsed = value;
    }
}

export class UserStore {
    public rootStore: RootStore;
    private _storedUser: AuthUser | null = null;
    public settings: Settings = new Settings();
    private _isSettingsLoaded: boolean = false;
    private _visitedPages: Set<string> = new Set();

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
        this.initializeStoredUser();
    }

    private initializeStoredUser() {
        try {
            const storedUser = getKeyValue(LS_APP_USER);
            if (storedUser) {
                this._storedUser = storedUser;
            }
        } catch {
            this._storedUser = null;
        }
    }

    public get authUser() {
        return this._storedUser;
    }

    public get isSettingsLoaded(): boolean {
        return this._isSettingsLoaded;
    }

    public set storedUser(user: AuthUser | null) {
        try {
            if (user) {
                const { permissions, ...restUserData } = user;
                this._storedUser = {
                    ...restUserData,
                    permissions: this._storedUser?.permissions || ({} as UserPermissionsResponse),
                };
                setKey(LS_APP_USER, JSON.stringify(this._storedUser));
            } else {
                this._storedUser = null;
                localStorage.removeItem(LS_APP_USER);
            }
        } catch {
            this._storedUser = null;
            localStorage.removeItem(LS_APP_USER);
        }
    }

    public set userPermissions(permissions: UserPermissionsResponse) {
        if (this._storedUser) {
            try {
                this._storedUser = { ...this._storedUser, permissions };
                setKey(LS_APP_USER, JSON.stringify(this._storedUser));
            } catch {
                Promise.reject(new Error("Failed to update user permissions"));
            }
        }
    }

    public set isSettingsLoaded(value: boolean) {
        this._isSettingsLoaded = value;
    }

    public isFirstVisit(pageId: string): boolean {
        return !this._visitedPages.has(pageId);
    }

    public markPageAsVisited(pageId: string): void {
        this._visitedPages.add(pageId);
    }
}
