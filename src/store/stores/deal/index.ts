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

export class DealStore {
    public rootStore: RootStore;
    private _deal: DealItem = {} as DealItem;
    private _dealExtData: DealExtData = {} as DealExtData;
    private _dealFinances: DealFinance = {} as DealFinance;
    private _dealPickupPayments: (DealPickupPayment & { changed?: boolean })[] = [];
    private _dealID: string = "";
    private _printList: DealPrintForm[] = [];
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

    public getDealFinances = async (dealuid: string) => {
        try {
            this._isLoading = true;
            const response = await getDealFinance(dealuid);
            if (response) {
                this._dealFinances = response;
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
                this._printList = [];
                Object.values(response).forEach((item) => {
                    this._printList = [...this._printList, ...item];
                });
            }
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    });

    public getPickupPayments = action(async (dealuid = this._dealID) => {
        try {
            this._isLoading = true;
            const response = await getDealPayments(dealuid);
            if (response) {
                this._dealPickupPayments = response;
            }
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    });

    public clearDeal = () => {
        this._deal = {} as DealItem;
        this._dealID = "";
        this._dealExtData = {} as DealExtData;
        this._dealFinances = {} as DealFinance;
        this._printList = [] as DealPrintForm[];
        this._dealPickupPayments = [] as DealPickupPayment[];
    };
}
