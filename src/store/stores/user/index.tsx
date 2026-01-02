import { LS_APP_USER, LS_DEVICE_UID, LS_REMEMBER_ME } from "common/constants/localStorage";
import { AuthUser, TWO_FACTOR_METHOD, UserPermissionsResponse } from "common/models/user";
import { setup2FA, verify2FA } from "http/services/auth.service";
import { makeAutoObservable, runInAction } from "mobx";
import { getKeyValue, localStorageClear, setKey } from "services/local-storage.service";
import { RootStore } from "store";
import { decryptPassword, encryptPassword } from "services/encryption.service";
import { v4 as uuidv4 } from "uuid";

export interface RememberMeData {
    username: string;
    encryptedPassword?: string;
}

class Settings {
    private _isSidebarCollapsed: boolean = true;

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

export enum TwoFactorAuthStep {
    INTRODUCTION = 1,
    PHONE_NUMBER = 2,
    VERIFICATION_CODE = 3,
    SUCCESS = 4,
}

class TwoFactorAuth {
    private _currentStep: TwoFactorAuthStep = TwoFactorAuthStep.INTRODUCTION;
    private _selectedMethod: TWO_FACTOR_METHOD | null = null;
    private _phoneNumber: string = "";
    private _email: string = "";
    private _verificationCode: string[] = ["", "", "", "", "", ""];
    private _backupCodes: string[] = [];
    private _resendTimer: number = 60;
    private _codeInputRefs: (HTMLInputElement | null)[] = [];
    private _isEnabled: boolean = false;
    private _twoFactorSessionUID: string = "";
    private _verificationToken: string = "";
    private _phoneMasked: string = "";
    private _emailMasked: string = "";

    constructor() {
        makeAutoObservable(this);
    }

    public get currentStep() {
        return this._currentStep;
    }

    public get selectedMethod() {
        return this._selectedMethod;
    }

    public get phoneNumber() {
        return this._phoneNumber;
    }

    public get email() {
        return this._email;
    }

    public get verificationCode() {
        return this._verificationCode;
    }

    public get backupCodes() {
        return this._backupCodes;
    }

    public get resendTimer() {
        return this._resendTimer;
    }

    public get codeInputRefs() {
        return this._codeInputRefs;
    }

    public get twoFactorSessionUID() {
        return this._twoFactorSessionUID;
    }

    public get verificationToken() {
        return this._verificationToken;
    }

    public get phoneMasked() {
        return this._phoneMasked;
    }

    public get emailMasked() {
        return this._emailMasked;
    }

    public set currentStep(step: TwoFactorAuthStep) {
        this._currentStep = step;
    }

    public set selectedMethod(method: TWO_FACTOR_METHOD | null) {
        this._selectedMethod = method;
    }

    public set phoneNumber(value: string) {
        this._phoneNumber = value;
    }

    public set email(value: string) {
        this._email = value;
    }

    public get isEnabled() {
        return this._isEnabled;
    }

    public set verificationCode(value: string[]) {
        this._verificationCode = value;
    }

    public set isEnabled(value: boolean) {
        this._isEnabled = value;
    }

    public set backupCodes(value: string[]) {
        this._backupCodes = value;
    }

    public set resendTimer(value: number) {
        this._resendTimer = value;
    }

    public set twoFactorSessionUID(value: string) {
        this._twoFactorSessionUID = value;
    }

    public set verificationToken(value: string) {
        this._verificationToken = value;
    }

    public set phoneMasked(value: string) {
        this._phoneMasked = value;
    }

    public set emailMasked(value: string) {
        this._emailMasked = value;
    }

    public setCodeInputRef(index: number, ref: HTMLInputElement | null) {
        this._codeInputRefs[index] = ref;
    }

    public async handleContinue(username?: string) {
        if (this._currentStep === TwoFactorAuthStep.INTRODUCTION) {
            if (this._selectedMethod === TWO_FACTOR_METHOD.SMS) {
                this._currentStep = TwoFactorAuthStep.PHONE_NUMBER;
                return true;
            } else if (this._selectedMethod === TWO_FACTOR_METHOD.EMAIL) {
                return await this.handleEmailSubmit(username);
            }
        }
        return false;
    }

    public async handleEmailSubmit(username?: string) {
        try {
            const response = await setup2FA({
                method: TWO_FACTOR_METHOD.EMAIL,
                user: username,
            });
            if (response && "2fasessionuid" in response) {
                runInAction(() => {
                    this._twoFactorSessionUID = response["2fasessionuid"];
                    this._emailMasked = response.email_masked || "";
                    this._currentStep = TwoFactorAuthStep.VERIFICATION_CODE;
                    this._resendTimer = 60;
                });
                setTimeout(() => {
                    this._codeInputRefs[0]?.focus();
                }, 100);
                return response;
            }
            return response;
        } catch (error) {
            return error;
        }
    }

    public handleCodeChange(index: number, value: string) {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        if (!/^\d*$/.test(value)) {
            return;
        }

        const newCode = [...this._verificationCode];
        newCode[index] = value;
        this._verificationCode = newCode;

        if (value && index < 5) {
            this._codeInputRefs[index + 1]?.focus();
        }
    }

    public handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Backspace" && !this._verificationCode[index] && index > 0) {
            this._codeInputRefs[index - 1]?.focus();
        }
    }

    public async handleVerificationCodeSubmit() {
        const code = this._verificationCode.join("");
        try {
            const response = await verify2FA({
                "2fasessionuid": this._twoFactorSessionUID,
                code,
            });

            if (response && "verification_token" in response) {
                runInAction(() => {
                    this._verificationToken = response.verification_token;
                    if (response.backup_codes && response.backup_codes.length > 0) {
                        this._backupCodes = response.backup_codes;
                        this._currentStep = TwoFactorAuthStep.SUCCESS;
                    }
                });
                return response;
            }
            return response;
        } catch (error) {
            return error;
        }
    }

    public async handlePhoneNumberSubmit(phoneNumber: string, username?: string) {
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
        this._phoneNumber = cleanPhoneNumber;
        try {
            const response = await setup2FA({
                method: TWO_FACTOR_METHOD.SMS,
                phone: cleanPhoneNumber,
                user: username,
            });
            if (response && "2fasessionuid" in response) {
                runInAction(() => {
                    this._twoFactorSessionUID = response["2fasessionuid"];
                    this._phoneMasked = response.phone_masked || "";
                    this._currentStep = TwoFactorAuthStep.VERIFICATION_CODE;
                    this._resendTimer = 60;
                });
                setTimeout(() => {
                    this._codeInputRefs[0]?.focus();
                }, 100);
                return response;
            }
            return response;
        } catch (error) {
            return error;
        }
    }

    public async handleResendCode() {
        if (this._resendTimer === 0) {
            try {
                const response = await setup2FA({
                    "2fasessionuid": this._twoFactorSessionUID,
                    method: this._selectedMethod || TWO_FACTOR_METHOD.SMS,
                });
                if (response && "2fasessionuid" in response) {
                    runInAction(() => {
                        this._resendTimer = 60;
                    });
                }
                return response;
            } catch (error) {
                return error;
            }
        }
    }

    public handleSaveBackupCodes() {
        const codesText = this._backupCodes.join("\n");
        const blob = new Blob([codesText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "2fa-backup-codes.txt";
        link.click();
        URL.revokeObjectURL(url);
    }

    public handlePrintBackupCodes() {
        window.print();
    }

    public handleCopyBackupCodes() {
        navigator.clipboard.writeText(this._backupCodes.join("\n"));
    }

    public decrementResendTimer() {
        if (this._currentStep === TwoFactorAuthStep.VERIFICATION_CODE && this._resendTimer > 0) {
            this._resendTimer = this._resendTimer - 1;
        }
    }

    public reset() {
        this._currentStep = TwoFactorAuthStep.INTRODUCTION;
        this._selectedMethod = null;
        this._phoneNumber = "";
        this._email = "";
        this._verificationCode = ["", "", "", "", "", ""];
        this._backupCodes = [];
        this._resendTimer = 60;
        this._codeInputRefs = [];
        this._twoFactorSessionUID = "";
        this._verificationToken = "";
        this._phoneMasked = "";
        this._emailMasked = "";
    }
}

export class UserStore {
    public rootStore: RootStore;
    private _storedUser: AuthUser | null = null;
    private _rememberMe: RememberMeData | null = null;
    public settings: Settings = new Settings();
    public twoFactorAuth: TwoFactorAuth = new TwoFactorAuth();
    private _isSettingsLoaded: boolean = false;
    private _visitedPages: Set<string> = new Set();
    private _deviceUID: string = "";

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
        this.initializeStoredUser();
        this.initializeRememberMe();
        this.initializeDeviceUID();
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

    private initializeRememberMe() {
        try {
            const rememberedData = getKeyValue(LS_REMEMBER_ME);
            if (rememberedData) {
                if (rememberedData.username) {
                    this._rememberMe = {
                        username: rememberedData.username,
                        encryptedPassword: rememberedData.encryptedPassword,
                    };
                } else {
                    this._rememberMe = null;
                }
            }
        } catch {
            this._rememberMe = null;
        }
    }

    private initializeDeviceUID() {
        try {
            const storedUID = localStorage.getItem(LS_DEVICE_UID);
            if (storedUID) {
                this._deviceUID = storedUID;
            } else {
                const newUID = uuidv4();
                localStorage.setItem(LS_DEVICE_UID, newUID);
                this._deviceUID = newUID;
            }
        } catch {
            this._deviceUID = uuidv4();
        }
    }

    public get deviceUID() {
        return this._deviceUID;
    }

    public get authUser() {
        return this._storedUser;
    }

    public get isSettingsLoaded(): boolean {
        return this._isSettingsLoaded;
    }

    public get rememberMe(): RememberMeData | null {
        return this._rememberMe;
    }

    public set rememberMe(value: RememberMeData | null) {
        this._rememberMe = value;
        this.setRememberMe();
    }

    public getDecryptedPassword(): string {
        if (this._rememberMe?.encryptedPassword) {
            return decryptPassword(this._rememberMe.encryptedPassword);
        }
        return "";
    }

    public setRememberMeWithPassword(username: string, password: string): void {
        this._rememberMe = {
            username,
            encryptedPassword: encryptPassword(password),
        };
        this.setRememberMe();
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
                localStorageClear(LS_APP_USER);
            }
        } catch {
            this._storedUser = null;
            localStorageClear(LS_APP_USER);
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

    private setRememberMe(): void {
        if (this._rememberMe) {
            setKey(LS_REMEMBER_ME, JSON.stringify(this._rememberMe));
        } else {
            localStorageClear(LS_REMEMBER_ME);
        }
    }

    public markPageAsVisited(pageId: string): void {
        this._visitedPages.add(pageId);
    }

    public clearStoredUser(): void {
        this._storedUser = null;
        localStorageClear(LS_APP_USER);
    }
}
