import { makeAutoObservable } from "mobx";
import { AuthUser } from "common/models/user";

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
    private _profile: ExtendedProfile = initialProfile;
    private _isProfileChanged: boolean = false;
    public constructor() {
        makeAutoObservable(this);
    }

    public get profile() {
        return this._profile;
    }

    public changeProfile = <K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) => {
        this._profile[key] = value as never;
        this._isProfileChanged = true;
    };

    public get isProfileChanged() {
        return this._isProfileChanged;
    }

    public set profile(profile: ExtendedProfile) {
        this._profile = profile;
    }
}
