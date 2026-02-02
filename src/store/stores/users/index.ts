import { SubUser, UserData, UserRole, UserRolePayload } from "common/models/users";
import { BaseResponseError, Status } from "common/models/base-response";
import {
    createUser,
    createOrUpdateRole,
    getRoleInfo,
    getUserData,
    getUserRoles,
} from "http/services/users";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";
import { PHONE_NUMBER_REGEX } from "common/constants/regex";
import { PERMISSION_KEYS, PermissionKey } from "common/constants/permissions";

const initialUserData: Partial<UserData> = {
    firstName: "",
    lastName: "",
    loginName: "",
    loginname: "",
    loginpassword: "",
    rolename: "",
    roleuid: "",
    email1: "",
    email: "",
    phone1: "",
    phone: "",
    middleName: "",
    enabled: 1,
    dealer_id: "",
    streetAddress: "",
    city: "",
    state: "",
    ZIP: "",
    salespersonLicense: "",
};

export class UsersStore {
    public rootStore: RootStore;
    private _user: Partial<UserData> = initialUserData;
    private _userRoles: UserRole[] = [] as UserRole[];
    private _availableRoles: UserRole[] = [];
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

    public get availableRoles() {
        return this._availableRoles;
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

    private normalizePermissions(permissions: any): Record<PermissionKey, 0 | 1> {
        const normalized = {} as Record<PermissionKey, 0 | 1>;

        PERMISSION_KEYS.forEach((key) => {
            normalized[key] = 0;
        });

        if (Array.isArray(permissions)) {
            permissions.forEach((perm: any) => {
                if (perm && perm.name && PERMISSION_KEYS.includes(perm.name)) {
                    normalized[perm.name as PermissionKey] = 1;
                }
            });
        } else if (permissions && typeof permissions === "object") {
            Object.keys(permissions).forEach((key) => {
                if (PERMISSION_KEYS.includes(key as any)) {
                    normalized[key as PermissionKey] = permissions[key] ? 1 : 0;
                }
            });
        }

        return normalized;
    }

    public getCurrentRole = async (roleuid: string) => {
        const response = await getRoleInfo(roleuid);
        if (response && "status" in response && response.status === Status.ERROR) {
            return {
                status: Status.ERROR,
                error: (response as BaseResponseError).error,
            };
        } else {
            const role = response as any;
            if (role) {
                role.permissions = this.normalizePermissions(role.permissions);
            }
            this._currentRole = role as UserRole;
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
            this._userRoles = (response as any[]).map((role) => ({
                ...role,
                permissions: this.normalizePermissions(role.permissions),
            })) as UserRole[];
        } else {
            this._userRoles = [] as UserRole[];
        }
    };

    public loadAvailableRoles = async (useruid: string) => {
        this._isLoading = true;
        try {
            const response = await getUserRoles(useruid);
            if (response && Array.isArray(response)) {
                this._availableRoles = (response as UserRole[]).slice(0, 4);
            } else {
                this._availableRoles = [];
            }
        } catch (error) {
            this._availableRoles = [];
        } finally {
            this._isLoading = false;
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

    public togglePermission = action((permissionName: PermissionKey) => {
        if (!this._currentRole) return;

        this._currentRole.permissions = {
            ...this._currentRole.permissions,
            [permissionName]: this._currentRole.permissions[permissionName] ? 0 : 1,
        };
    });

    public hasRolePermission = (permissionName: PermissionKey): boolean => {
        if (!this._currentRole) return false;
        return this._currentRole.permissions[permissionName] === 1;
    };

    public togglePermissionsGroup = action((permissionKeys?: readonly PermissionKey[]): boolean => {
        if (!this._currentRole) return false;

        const keysToToggle = permissionKeys ?? PERMISSION_KEYS;
        const allChecked = keysToToggle.every((key) => this.hasRolePermission(key));
        const newValue = allChecked ? 0 : 1;

        const updatedPermissions = { ...this._currentRole.permissions };
        keysToToggle.forEach((key) => {
            updatedPermissions[key] = newValue;
        });

        this._currentRole.permissions = updatedPermissions;

        return !allChecked;
    });

    public get currentRolePermissions(): Record<PermissionKey, 0 | 1> | {} {
        if (!this._currentRole) return {};
        return this._currentRole.permissions;
    }

    public saveCurrentRole = async () => {
        if (!this._currentRole) {
            return {
                status: Status.ERROR,
                error: "No role to save",
            };
        }

        const payload: UserRolePayload = {
            rolename: this._currentRole.rolename,
            permissions: this._currentRole.permissions,
        };

        const response = await createOrUpdateRole(this._currentRole.roleuid || "", payload);

        if (response && response.status === Status.ERROR) {
            return {
                status: Status.ERROR,
                error: (response as BaseResponseError).error,
            };
        }

        return response;
    };

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
        const userData = {
            loginname: this._user.loginName || "",
            loginpassword: this._password,
            enabled: this._user.enabled || 1,
            dealer_id: this.rootStore.userStore.authUser?.dealer_id || "0",
            roleuid: this._user.roleuid || "",
            firstName: this._user.firstName || "",
            lastName: this._user.lastName || "",
            middleName: this._user.middleName || "",
            phone: this._user.phone1 || "",
            email: this._user.email1 || "",
            streetAddress: this._user.streetAddress || "",
            city: this._user.city || "",
            state: this._user.state || "",
            ZIP: this._user.ZIP || "",
            salespersonLicense: this._user.salespersonLicense || "",
        };

        const response = await createUser(
            this.rootStore.userStore.authUser?.dealer_id || "",
            userData as Partial<UserData>
        );
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
        const hasValidPhone = PHONE_NUMBER_REGEX.test(this._user.phone1 || "");
        const hasEmail = !!this._user.email1;

        return (
            !!this._user.firstName &&
            !!this._user.lastName &&
            !!this._user.loginName &&
            !!this._user.roleuid &&
            (hasValidPhone || hasEmail) &&
            !!this._password &&
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
        if (role && role.permissions) {
            role.permissions = this.normalizePermissions(role.permissions);
        }
        this._currentRole = role;
    }

    public createNewRole = action(() => {
        this._currentRole = {
            created: "",
            deleted: "",
            isDefault: 0,
            name: "",
            permissions: this.normalizePermissions({}),
            rolename: "",
            roleuid: "",
            updated: "",
            useruid: this.rootStore.userStore.authUser?.useruid || "",
        };
    });
}
