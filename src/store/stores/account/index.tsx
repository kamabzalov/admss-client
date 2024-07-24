/* eslint-disable no-unused-vars */

import { Status } from "common/models/base-response";
import { AccountInfo, AccountExtData } from "common/models/accounts";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";
import { createOrUpdateAccount, getAccountInfo } from "http/services/accounts.service";

export class AccountStore {
    public rootStore: RootStore;
    private _account: Partial<AccountInfo> = {} as AccountInfo;
    private _accountExtData: AccountExtData = {} as AccountExtData;
    private _accountID: string = "";
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get account() {
        return this._account;
    }

    public get accountExtData() {
        return this._accountExtData;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public getAccount = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getAccountInfo(itemuid);
            if (response) {
                const { extdata, ...account } = response as AccountInfo;

                this._accountID = account.accountuid;

                this._account = account || ({} as AccountInfo);
                this._accountExtData = extdata || ({} as AccountExtData);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public changeAccount = action(
        (key: keyof Omit<AccountInfo, "extdata">, value: string | number | string[]) => {
            this._account[key] = value as never;
        }
    );

    public changeAccountExtData = action((key: keyof AccountExtData, value: string | number) => {
        this._accountExtData[key] = value as never;
    });

    public saveAccount = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;

            createOrUpdateAccount(this._accountID, {
                ...this._account,
                extdata: this._accountExtData,
            });

            return Status.ERROR;
        } catch (error) {
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public clearAccount = () => {
        this._account = {} as AccountInfo;
        this._accountID = "";
        this._accountExtData = {} as AccountExtData;
    };
}
