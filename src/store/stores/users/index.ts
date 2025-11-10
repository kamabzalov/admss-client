import { SubUser, UserData, UserRole } from "common/models/users";
import { BaseResponseError, Status } from "common/models/base-response";
import { createUser, getRoleInfo, getUserData, getUserRoles } from "http/services/users";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";
import { PHONE_NUMBER_REGEX } from "common/constants/regex";

const initialUserData: Partial<UserData> = {
    firstName: "",
    lastName: "",
    loginName: "",
    rolename: "",
    roleuid: "",
    email1: "",
    phone1: "",
    middleName: "",
};

export class UsersStore {
    public rootStore: RootStore;
    private _user: Partial<UserData> = initialUserData;
    private _userRoles: UserRole[] = [] as UserRole[];
    private _currentRole: UserRole | null = null;
    private _password: string = "";
    private _passwordMismatch: boolean = false;
    protected _isLoading = false;

    public get user() {
        return this._user;
    }

    public get userRoles() {
        return this._userRoles;
    }

    public get password() {
        return this._password;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public get currentRole() {
        return this._currentRole;
    }

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public getCurrentRole = async (roleuid: string) => {
        const response = await getRoleInfo(roleuid);
        if (response && "status" in response && response.status === Status.ERROR) {
            return {
                status: Status.ERROR,
                error: (response as BaseResponseError).error,
            };
        } else {
            this._currentRole = response as UserRole;
        }
    };

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

    public getCurrentUserRoles = async (useruid: string) => {
        const response = await getUserRoles(useruid);
        if (response && Array.isArray(response)) {
            this._userRoles = response as UserRole[];
        } else {
            this._userRoles = [] as UserRole[];
        }
    };

    public changeCurrentRole = action(
        <K extends keyof UserRole>(keyOrEntries: K | [K, UserRole[K]][], value?: UserRole[K]) => {
            if (!this._currentRole) return;

            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    if (this._currentRole) {
                        this._currentRole[key] = val;
                    }
                });
            } else {
                if (value !== undefined) {
                    this._currentRole[keyOrEntries] = value;
                }
            }
        }
    );

    public changeUserData = action(
        <K extends keyof UserData>(keyOrEntries: K | [K, UserData[K]][], value?: UserData[K]) => {
            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    this._user[key] = val;
                });
            } else {
                if (value !== undefined) {
                    this._user[keyOrEntries] = value;
                }
            }
        }
    );

    public createUser = async () => {
        const response = await createUser(this.rootStore.userStore.authUser?.useruid || "", {
            ...this._user,
            password: this._password,
        } as Partial<UserData>);
        if (response && response.status === Status.ERROR) {
            return {
                status: Status.ERROR,
                error: response?.error,
            };
        }
    };

    public currentUserClear = action(() => {
        this._user = initialUserData;
        this._userRoles = [] as UserRole[];
    });

    public get isFormValid(): boolean {
        return (
            !!this._user.firstName &&
            !!this._user.lastName &&
            !!this._user.loginName &&
            PHONE_NUMBER_REGEX.test(this._user.phone1 || "") &&
            !this._passwordMismatch
        );
    }

    public set password(password: string) {
        this._password = password;
    }

    public set passwordMismatch(mismatch: boolean) {
        this._passwordMismatch = mismatch;
    }

    public set currentRole(role: UserRole | null) {
        this._currentRole = role;
    }
}
