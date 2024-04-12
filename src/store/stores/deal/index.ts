import { Status } from "common/models/base-response";
import { makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class DealStore {
    public rootStore: RootStore;
    private _deal = {};
    private _dealID: string = "";
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get deal() {
        return this._deal;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public getDeal = async (itemuid: string) => {
        this._isLoading = true;
        try {
            return Status.OK;
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public clearDeal = () => {
        this._deal = {};
    };
}
