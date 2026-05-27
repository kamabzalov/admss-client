import { makeAutoObservable } from "mobx";
import { AuthUser } from "common/models/user";
import { RootStore } from "store";
import {
    updateUserProfile,
    changePassword,
    checkPassword,
    getUserData,
    getUserLocations,
    setUserLocations,
    getDealerLocations,
} from "http/services/users";
import { UserData, CheckPasswordResponse } from "common/models/users";
import { BaseResponseError, Status } from "common/models/base-response";
import { typeGuards } from "common/utils";
import { getUserLogo, uploadUserLogo } from "http/services/media.service";
import { InventoryLocations } from "common/models/inventory";

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
    private _logo: string | null = null;
    private _logoPreview: string | null = null;
    private _logoFile: File | null = null;
    private _logoLoadedUseruid: string | null = null;
    private _logoLoadFailed: boolean = false;
    private _logoLoading: boolean = false;
    private _currentPassword: string = "";
    private _newPassword: string = "";
    private _confirmPassword: string = "";
    private _currentPasswordError: boolean = false;
    private _currentPasswordErrorMessage: string | null = null;
    private _isValidatingPassword: boolean = false;
    private _currentLocation: Partial<InventoryLocations> | null = null;
    private _locations: InventoryLocations[] = [];
    private _selectedLocationUid: string = "";
    private _dealerLocations: InventoryLocations[] = [];
    private _selectedLocationUids: string[] = [];
    private _hasUnsavedLocationChanges: boolean = false;
    private _showLocationsWarning: boolean = false;
    private _isLocationsSaving: boolean = false;
    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;

        const authUser = this.rootStore.userStore.authUser;

        if (authUser) {
            this._profile = {
                ...this._profile,
                companyname: authUser.companyname || "",
                locationname: authUser.locationname || "",
            };
        }
    }

    public get profile() {
        return this._profile;
    }

    public get displayedLogo() {
        return this._logoPreview || this._logo;
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

    public get locations() {
        return this._locations;
    }

    public get selectedLocationUid() {
        return this._selectedLocationUid;
    }

    public get dealerLocations() {
        return this._dealerLocations;
    }

    public get selectedLocationUids() {
        return this._selectedLocationUids;
    }

    public get hasUnsavedLocationChanges() {
        return this._hasUnsavedLocationChanges;
    }

    public get showLocationsWarning() {
        return this._showLocationsWarning;
    }

    public get isLocationsSaving() {
        return this._isLocationsSaving;
    }

    public set profile(profile: ExtendedProfile) {
        this._profile = profile;
    }

    public changeCurrentLocation(locationuid: string) {
        const selectedLocation = this._locations.find(
            (location) => location.locationuid === locationuid
        );
        if (!selectedLocation) {
            return;
        }

        const hasLocationChanged = this._selectedLocationUid !== locationuid;
        this._selectedLocationUid = locationuid;
        this._currentLocation = selectedLocation;
        this._profile = {
            ...this._profile,
            locationname: selectedLocation.locName || "",
            address: selectedLocation.locStreetAddress || "",
            state: selectedLocation.locState || "",
            zipCode: selectedLocation.locZIP || "",
            phoneNumber: selectedLocation.locPhone1 || "",
            email: selectedLocation.locEmail1 || "",
        };
        this._isProfileChanged = hasLocationChanged;
    }

    public changeSelectedLocations = (locationUids: string[]) => {
        const uniqueUids = Array.from(new Set(locationUids));
        const prevSorted = [...this._selectedLocationUids].sort().join(",");
        const nextSorted = [...uniqueUids].sort().join(",");
        const hasSelectionChanged = prevSorted !== nextSorted;

        this._selectedLocationUids = uniqueUids;

        const primaryUid = uniqueUids[0];
        const primaryLocation = primaryUid
            ? this._dealerLocations.find((location) => location.locationuid === primaryUid) ||
              this._locations.find((location) => location.locationuid === primaryUid) ||
              null
            : null;
        this._currentLocation = primaryLocation;

        if (primaryLocation) {
            this._profile = {
                ...this._profile,
                locationname: primaryLocation.locName || "",
                address: primaryLocation.locStreetAddress || "",
                state: primaryLocation.locState || "",
                zipCode: primaryLocation.locZIP || "",
                phoneNumber: primaryLocation.locPhone1 || "",
                email: primaryLocation.locEmail1 || "",
            };
        }

        if (hasSelectionChanged) {
            this._isProfileChanged = true;
            this._hasUnsavedLocationChanges = true;
        }
    };

    public markLocationsBlurred = () => {
        if (this._hasUnsavedLocationChanges) {
            this._showLocationsWarning = true;
        }
    };

    public setLogoFile(file: File | null) {
        this._logoFile = file;
        if (file) {
            this._isProfileChanged = true;
        }
    }

    public setLogoPreview(logoPreview: string | null) {
        this._logoPreview = logoPreview;
        if (logoPreview) {
            this._isProfileChanged = true;
        }
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

    public resetLogoCache = () => {
        this._logo = null;
        this._logoPreview = null;
        this._logoFile = null;
        this._logoLoadedUseruid = null;
        this._logoLoadFailed = false;
        this._logoLoading = false;
    };

    public loadLogo = async (useruid: string) => {
        if (this._logoLoading) {
            return;
        }

        if (
            this._logoLoadedUseruid === useruid &&
            (this._logo !== null || this._logoPreview !== null || this._logoLoadFailed)
        ) {
            return;
        }

        this._logoLoading = true;

        try {
            const logo = await getUserLogo(useruid);
            this._logoLoadedUseruid = useruid;

            if (logo) {
                this._logo = logo;
                this._logoPreview = null;
                this._logoLoadFailed = false;
            } else {
                this._logo = null;
                this._logoPreview = null;
                this._logoLoadFailed = true;
            }
        } catch {
            this._logoLoadedUseruid = useruid;
            this._logo = null;
            this._logoPreview = null;
            this._logoLoadFailed = true;
        } finally {
            this._logoLoading = false;
        }
    };

    public loadProfile = async () => {
        const authUser = this.rootStore.userStore.authUser;

        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        try {
            const [response, locationsResponse, dealerLocationsResponse] = await Promise.all([
                getUserData(authUser.useruid),
                getUserLocations(authUser.useruid),
                authUser.dealer_id
                    ? getDealerLocations(authUser.dealer_id)
                    : Promise.resolve(undefined),
            ]);

            if (!response || typeGuards.isExist(response.error)) {
                return response as BaseResponseError | undefined;
            }

            const userData = response as UserData;
            const userLocations = Array.isArray(locationsResponse) ? locationsResponse : [];
            const dealerLocations = Array.isArray(dealerLocationsResponse)
                ? dealerLocationsResponse
                : [];
            const currentLocation =
                userLocations.find((location) => location.locationuid === authUser.locationuid) ||
                userLocations[0];

            const dealerLocationUids = new Set(
                dealerLocations
                    .map((location) => location.locationuid)
                    .filter((uid): uid is string => !!uid)
            );
            const selectedUids = userLocations
                .map((location) => location.locationuid)
                .filter((uid): uid is string => !!uid)
                .filter((uid) => dealerLocationUids.has(uid));

            this._locations = userLocations;
            this._selectedLocationUid = currentLocation?.locationuid || "";
            this._currentLocation = currentLocation || null;
            this._dealerLocations = dealerLocations;
            this._selectedLocationUids = selectedUids;
            this._hasUnsavedLocationChanges = false;
            this._showLocationsWarning = false;

            this._profile = {
                ...this._profile,
                companyname: userData.companyName || authUser.companyname || "",
                locationname:
                    currentLocation?.locName || userData.city || authUser.locationname || "",
                address: currentLocation?.locStreetAddress || userData.streetAddress || "",
                state: currentLocation?.locState || userData.state || "",
                zipCode: currentLocation?.locZIP || userData.ZIP || "",
                phoneNumber: currentLocation?.locPhone1 || userData.phone || userData.phone1 || "",
                email: currentLocation?.locEmail1 || userData.email || userData.email1 || "",
            };

            this._isProfileChanged = false;

            return userData;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            } as BaseResponseError;
        }
    };

    public saveProfile = async () => {
        const authUser = this.rootStore.userStore.authUser;
        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        const convertEmptyValue = (value: string | undefined): string => {
            return value === "" || value === undefined ? "" : value;
        };

        const userData: Partial<UserData> = {
            phone: convertEmptyValue(this._profile.phoneNumber),
            email: convertEmptyValue(this._profile.email),
        };

        try {
            const response = await updateUserProfile(authUser.useruid, userData);

            if (response && typeGuards.isExist(response.error)) {
                return response as BaseResponseError;
            }

            if (this._logoFile) {
                const logoResponse = (await uploadUserLogo(authUser.useruid, this._logoFile)) as
                    | BaseResponseError
                    | undefined;

                if (logoResponse && logoResponse.status === Status.ERROR) {
                    return logoResponse;
                }

                this._logoFile = null;
                if (this._logoPreview) {
                    this._logo = this._logoPreview;
                    this._logoPreview = null;
                }
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

    public saveLocations = async () => {
        const authUser = this.rootStore.userStore.authUser;
        if (!authUser?.useruid) {
            return {
                status: Status.ERROR,
                error: "User is not authenticated",
            } as BaseResponseError;
        }

        this._isLocationsSaving = true;
        try {
            const selectedLocations: Partial<InventoryLocations>[] = this._dealerLocations
                .filter((location) => this._selectedLocationUids.includes(location.locationuid))
                .map((location) => ({
                    ...location,
                    useruid: authUser.useruid,
                }));

            const response = await setUserLocations(authUser.useruid, selectedLocations);
            if (response && typeGuards.isExist(response.error)) {
                return response as BaseResponseError;
            }

            this._hasUnsavedLocationChanges = false;
            this._showLocationsWarning = false;
            return response;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            } as BaseResponseError;
        } finally {
            this._isLocationsSaving = false;
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
            const response = await changePassword(authUser.useruid, {
                current_password: this._currentPassword,
                new_password: this._newPassword,
            });

            if (response && typeGuards.isExist(response.error)) {
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
