import { BaseResponseError, Status } from "common/models/base-response";
import {
    Deal,
    DealExtData,
    DealFinance,
    DealPickupPayment,
    DealPrintForm,
} from "common/models/deals";
import {
    getDealFinance,
    getDealInfo,
    getDealPayments,
    getDealPrintForms,
    setDeal,
    setDealFinance,
    setDealPayments,
} from "http/services/deals.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

interface DealItem extends Omit<Deal, "extdata"> {}

interface DealPrintCollection {
    [key: string]: DealPrintForm[];
}

export class DealStore {
    public rootStore: RootStore;
    private _deal: DealItem = {} as DealItem;
    private _dealExtData: DealExtData = {} as DealExtData;
    private _dealFinances: DealFinance = {} as DealFinance;
    private _dealPickupPayments: (DealPickupPayment & { changed?: boolean })[] = [];
    private _dealID: string = "";
    private _printList: DealPrintCollection = {};
    private _dealErrorMessage: string = "";
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

    public get dealFinances() {
        return this._dealFinances;
    }

    public get printList() {
        return this._printList;
    }

    public get dealPickupPayments() {
        return this._dealPickupPayments;
    }

    public get dealErrorMessage() {
        return this._dealErrorMessage;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public getDeal = async (itemuid: string) => {
        this._isLoading = true;
        this._dealErrorMessage = "";
        try {
            const response = await getDealInfo(itemuid);
            if (response?.status === Status.OK) {
                const { extdata, ...deal } = response as Deal;
                this._deal = deal;
                this._dealID = extdata.dealUID;
                this._dealExtData = extdata || ({} as DealExtData);
            } else {
                const { error } = response as BaseResponseError;
                this._dealErrorMessage = error!;
            }
        } finally {
            this._isLoading = false;
        }
    };

    public getDealFinances = async (dealuid: string) => {
        try {
            this._isLoading = true;
            this._dealErrorMessage = "";
            const response = await getDealFinance(dealuid);
            if (response && response.status === Status.OK) {
                this._dealFinances = response as DealFinance;
            } else {
                const { error } = response as BaseResponseError;
                this._dealErrorMessage = error!;
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

    public changeDealFinances = action(
        ({ key, value }: { key: keyof DealFinance; value: string | number }) => {
            const dealStore = this.rootStore.dealStore;
            if (dealStore) {
                const { dealFinances } = dealStore;
                (dealFinances as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeDealPickupPayments = action(
        (
            itemuid: string,
            { key, value }: { key: keyof DealPickupPayment; value: string | number }
        ) => {
            const dealStore = this.rootStore.dealStore;
            if (dealStore) {
                const currentPayment = dealStore.dealPickupPayments.find(
                    (item) => item.itemuid === itemuid
                );
                if (currentPayment) {
                    (currentPayment as Record<typeof key, string | number>)[key] = value;
                    currentPayment.changed = true;
                }
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
            const dealResponse = await setDeal(this._dealID, dealData);
            const financesResponse = await setDealFinance(this._dealID, this._dealFinances);
            const paymentsResponse = await this._dealPickupPayments
                .filter((item) => item.changed)
                .forEach((item) => {
                    const { changed, ...payment } = item;
                    setDealPayments(item.itemuid, payment);
                });
            await Promise.race([dealResponse, financesResponse, paymentsResponse]).then(
                (response) => (response ? this._dealID : undefined)
            );
        } catch (error) {
            // TODO: add error handlers
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public getPrintList = action(async (dealuid = this._dealID) => {
        try {
            this._isLoading = true;
            const response = await getDealPrintForms(dealuid);
            if (response) {
                const { error, status, ...printCollection } = response;
                this._printList = printCollection;
            }
        } finally {
            this._isLoading = false;
        }
    });

    public getPickupPayments = action(async (dealuid = this._dealID) => {
        try {
            this._isLoading = true;
            this._dealErrorMessage = "";
            const response = await getDealPayments(dealuid);
            if (Array.isArray(response)) {
                this._dealPickupPayments = response;
            } else {
                this._dealErrorMessage = response.error as string;
            }
        } finally {
            this._isLoading = false;
        }
    });

    public clearDeal = () => {
        this._deal = {} as DealItem;
        this._dealErrorMessage = "";
        this._dealID = "";
        this._dealExtData = {} as DealExtData;
        this._dealFinances = {} as DealFinance;
        this._printList = {} as DealPrintCollection;
        this._dealPickupPayments = [] as DealPickupPayment[];
    };
}
