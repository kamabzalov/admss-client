import { SubUser, UserData, UserRole, UserRolePayload, SalespersonInfo } from "common/models/users";
import { BaseResponseError, Status } from "common/models/base-response";
import {
    createUser,
    createOrUpdateRole,
    getRoleInfo,
    getUserData,
    getUserRoles,
    getSalespersonInfo,
    updateSalespersonInfo,
    setUserData,
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

const initialSalespersonInfo: Partial<SalespersonInfo> = {
    Commission: 0,
    CommissionType: 0,
    VehicleProfit: 0,
    OverallIncome: 0,
    Acquisition: 0,
    Reserve: 0,
    FinanceIncome: 0,
    MiscCost: 0,
    MiscProfit: 0,
    AccessoryProfit: 0,
    GPUProfit: 0,
    CreditLifeProfit: 0,
    GAPProfit: 0,
    DPProfit: 0,
    VehiclePack: 0,
    Devices: 0,
    InterestRate: 0,
};

export class UsersStore {
    public rootStore: RootStore;
    private _user: Partial<UserData> = initialUserData;
    private _userRoles: UserRole[] = [] as UserRole[];
    private _availableRoles: UserRole[] = [];
    private _currentRole: UserRole | null = null;
    private _password: string = "";
    private _passwordMismatch: boolean = false;
    private _loginError: boolean = false;
    private _salespersonInfo: Partial<SalespersonInfo> = initialSalespersonInfo;
    private _isUserChanged: boolean = false;
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

    public get loginError() {
        return this._loginError;
    }

    public get salespersonInfo() {
        return this._salespersonInfo;
    }

    public get isUserChanged() {
        return this._isUserChanged;
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
                this._isUserChanged = false;
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
            this._isUserChanged = true;
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
        const newUseruid = "0";
        const dealer_id =
            this.rootStore.userStore.authUser?.dealer_id ||
            this.rootStore.userStore.authUser?.useruid ||
            "0";
        const userData = {
            loginname: this._user.loginName || "",
            loginpassword: this._password,
            enabled: this._user.enabled || 1,
            dealer_id,
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

        const response = await createUser(newUseruid, userData as Partial<UserData>);
        if (response && response.status === Status.ERROR) {
            return {
                status: Status.ERROR,
                error: response?.error,
            };
        }

        if (response && "useruid" in response && response.useruid) {
            const salespersonResponse = await this.updateSalespersonInfo(
                response.useruid as string
            );
            if (
                salespersonResponse &&
                "status" in salespersonResponse &&
                salespersonResponse.status === Status.ERROR
            ) {
                console.warn("Failed to save salesperson info:", salespersonResponse.error);
            }
        }

        return response;
    };

    public updateUser = async (useruid: string) => {
        const userData: Partial<UserData> = {
            loginname: this._user.loginName || this._user.loginname || "",
            enabled: this._user.enabled || 1,
            roleuid: this._user.roleuid || "",
            firstName: this._user.firstName || "",
            lastName: this._user.lastName || "",
            middleName: this._user.middleName || "",
            phone: this._user.phone1 || this._user.phone || "",
            email: this._user.email1 || this._user.email || "",
            streetAddress: this._user.streetAddress || "",
            city: this._user.city || "",
            state: this._user.state || "",
            ZIP: this._user.ZIP || "",
            salespersonLicense: this._user.salespersonLicense || "",
        };

        if (this._password) {
            userData.loginpassword = this._password;
        }

        try {
            const response = await setUserData(useruid, userData);
            if (response && response.status === Status.ERROR) {
                return {
                    status: Status.ERROR,
                    error: response?.error,
                };
            }

            const salespersonResponse = await this.updateSalespersonInfo(useruid);
            if (
                salespersonResponse &&
                "status" in salespersonResponse &&
                salespersonResponse.status === Status.ERROR
            ) {
                return salespersonResponse;
            }

            return response;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        }
    };

    public getSalespersonInfo = async (useruid: string) => {
        try {
            const response = await getSalespersonInfo(useruid);
            if (response && "status" in response && response.status === Status.ERROR) {
                return {
                    status: Status.ERROR,
                    error: (response as BaseResponseError).error,
                };
            } else {
                this._salespersonInfo = response as SalespersonInfo;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        }
    };

    public updateSalespersonInfo = async (useruid: string) => {
        try {
            const response = await updateSalespersonInfo(useruid, this._salespersonInfo);
            if (response && "status" in response && response.status === Status.ERROR) {
                return {
                    status: Status.ERROR,
                    error: (response as BaseResponseError).error,
                };
            }
            return response;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        }
    };

    public changeSalespersonInfo = action(
        <K extends keyof SalespersonInfo>(
            keyOrEntries: K | [K, SalespersonInfo[K]][],
            value?: SalespersonInfo[K]
        ) => {
            this._isUserChanged = true;
            if (Array.isArray(keyOrEntries)) {
                keyOrEntries.forEach(([key, val]) => {
                    this._salespersonInfo[key] = val;
                });
            } else {
                if (value !== undefined) {
                    this._salespersonInfo[keyOrEntries] = value;
                }
            }
        }
    );

    public currentUserClear = action(() => {
        this._user = initialUserData;
        this._userRoles = [] as UserRole[];
        this._password = "";
        this._passwordMismatch = false;
        this._loginError = false;
        this._salespersonInfo = initialSalespersonInfo;
        this._isUserChanged = false;
    });

    public get isFormValid(): boolean {
        const hasValidPhone = PHONE_NUMBER_REGEX.test(this._user.phone1 || "");
        const hasEmail = !!this._user.email1;
        const isEditMode = !!this._user.useruid;
        const isPasswordValid = isEditMode
            ? !this._passwordMismatch
            : !!this._password && !this._passwordMismatch;

        return (
            !!this._user.firstName &&
            !!this._user.lastName &&
            !!this._user.loginName &&
            !!this._user.roleuid &&
            (hasValidPhone || hasEmail) &&
            isPasswordValid &&
            !this._loginError
        );
    }

    public set password(password: string) {
        this._password = password;
        this._isUserChanged = true;
    }

    public set passwordMismatch(mismatch: boolean) {
        this._passwordMismatch = mismatch;
    }

    public set loginError(error: boolean) {
        this._loginError = error;
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
