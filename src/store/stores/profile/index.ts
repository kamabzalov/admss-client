import { makeAutoObservable } from "mobx";
import { AuthUser } from "common/models/user";
import { RootStore } from "store";
import { updateUserProfile, changePassword, checkPassword } from "http/services/users";
import { UserData, CheckPasswordResponse } from "common/models/users";
import { BaseResponseError, Status } from "common/models/base-response";

export interface ExtendedProfile extends Partial<AuthUser> {
    address: string;
    state: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
}

const initialProfile: ExtendedProfile = {
    companyname: "",
    locationname: "",
    address: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
};

export class ProfileStore {
    public rootStore: RootStore;
    private _profile: ExtendedProfile = initialProfile;
    private _isProfileChanged: boolean = false;
    private _currentPassword: string = "";
    private _newPassword: string = "";
    private _confirmPassword: string = "";
    private _currentPasswordError: boolean = false;
    private _currentPasswordErrorMessage: string | null = null;
    private _isValidatingPassword: boolean = false;
    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get profile() {
        return this._profile;
    }

    public changeProfile = <K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) => {
        const currentValue = this._profile[key];

        if (currentValue === value) {
            return;
        }

        this._profile[key] = value as never;
        this._isProfileChanged = true;
    };

    public get isProfileChanged() {
        return this._isProfileChanged;
    }

    public set profile(profile: ExtendedProfile) {
        this._profile = profile;
    }

    public markProfileSaved() {
        this._isProfileChanged = false;
    }

    public get currentPassword() {
        return this._currentPassword;
    }

    public get newPassword() {
        return this._newPassword;
    }

    public get confirmPassword() {
        return this._confirmPassword;
    }

    public get currentPasswordError() {
        return this._currentPasswordError;
    }

    public get currentPasswordErrorMessage() {
        return this._currentPasswordErrorMessage;
    }

    public get isValidatingPassword() {
        return this._isValidatingPassword;
    }

    public get passwordsMismatch() {
        return this._newPassword !== this._confirmPassword && this._confirmPassword.length > 0;
    }

    public setCurrentPassword(password: string) {
        this._currentPassword = password;
        this._currentPasswordError = false;
        this._currentPasswordErrorMessage = null;
    }

    public setNewPassword(password: string) {
        this._newPassword = password;
    }

    public setConfirmPassword(password: string) {
        this._confirmPassword = password;
    }

    public resetCurrentPasswordError() {
        this._currentPasswordError = false;
        this._currentPasswordErrorMessage = null;
    }

    public setIsValidatingPassword(state: boolean) {
        this._isValidatingPassword = state;
    }

    public resetPasswordForm() {
        this._currentPassword = "";
        this._newPassword = "";
        this._confirmPassword = "";
        this.resetCurrentPasswordError();
        this._isValidatingPassword = false;
    }

    public saveProfile = async () => {
        const authUser = this.rootStore.userStore.authUser;
        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        const userData: Partial<UserData> = {
            companyName: this._profile.companyname || authUser.companyname,
            city: this._profile.locationname || authUser.locationname,
            streetAddress: this._profile.address,
            state: this._profile.state,
            ZIP: this._profile.zipCode,
            phone: this._profile.phoneNumber,
            email: this._profile.email,
        };

        try {
            const response = await updateUserProfile(authUser.useruid, userData);

            if (response && "error" in response && (response as BaseResponseError).error) {
                return response as BaseResponseError;
            }

            this._isProfileChanged = false;
            return response;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            } as BaseResponseError;
        }
    };

    public setCurrentPasswordError(state: boolean, message?: string) {
        this._currentPasswordError = state;
        this._currentPasswordErrorMessage = state ? message || null : null;
    }

    public changeUserPassword = async () => {
        const authUser = this.rootStore.userStore.authUser;
        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        try {
            const response = await changePassword(authUser.useruid, this._newPassword);

            if (response && "error" in response && (response as BaseResponseError).error) {
                return response as BaseResponseError;
            }

            this.resetPasswordForm();
            return response;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            } as BaseResponseError;
        }
    };

    public validateCurrentPassword = async (
        currentPassword: string
    ): Promise<CheckPasswordResponse | BaseResponseError | undefined> => {
        const authUser = this.rootStore.userStore.authUser;
        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        return checkPassword(authUser.useruid, currentPassword);
    };
}
