import { Deal, DealExtData } from "common/models/deals";
import { getDealInfo, setDeal } from "http/services/deals.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

interface DealItem extends Omit<Deal, "extdata"> {}

export class DealStore {
    public rootStore: RootStore;
    private _deal: DealItem = {} as DealItem;
    private _dealExtData: DealExtData = {} as DealExtData;
    private _dealID: string = "";
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get deal() {
        return this._deal;
    }
    public get dealExtData() {
        return this._dealExtData;
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
            const response = await getDealInfo(itemuid);
            if (response) {
                const { extdata, ...deal } = response;
                this._deal = deal;
                this._dealID = extdata.dealUID;
                this._dealExtData = extdata || ({} as DealExtData);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public changeDeal = action(({ key, value }: { key: keyof Deal; value: string | number }) => {
        if (this._deal && key !== "extdata") {
            (this._deal as Record<typeof key, string | number>)[key] = value;
        }
    });

    public changeDealExtData = action(
        ({ key, value }: { key: keyof DealExtData; value: string | number }) => {
            const dealStore = this.rootStore.dealStore;
            if (dealStore) {
                const { dealExtData } = dealStore;
                (dealExtData as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public saveDeal = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;
            const dealData: Deal = {
                ...this._deal,
                extdata: this._dealExtData,
            };
            const response = await setDeal(this._dealID, dealData);

            return response?.status;
        } catch (error) {
            // TODO: add error handlers
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public clearDeal = () => {
        this._deal = {} as DealItem;
        this._dealExtData = {} as DealExtData;
    };
}
