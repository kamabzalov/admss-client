import { AxiosError } from "axios";
import { convertToStandardTimestamp } from "common/helpers";
import { BaseResponseError, Status } from "common/models/base-response";
import {
    Deal,
    DealExtData,
    DealFinance,
    DealPickupPayment,
    DealPrintForm,
    DealWashout,
    AddToInventory,
} from "common/models/deals";
import { Inventory } from "common/models/inventory";
import {
    getDealFinance,
    getDealInfo,
    getDealPayments,
    getDealPrintForms,
    getDealWashout,
    setDeal,
    setDealFinance,
    setDealPayments,
} from "http/services/deals.service";
import { getInventoryInfo } from "http/services/inventory-service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

interface DealItem extends Omit<Deal, "extdata" | "finance"> {}

interface DealPrintCollection {
    [key: string]: DealPrintForm[];
}

export enum DEAL_DELETE_MESSAGES {
    DELETE_DEAL = "Do you really want to delete this deal? This action cannot be undone.",
    DELETE_DEAL_WITH_OPTIONS = "Do you really want to delete the deal with all related options you've selected? This action cannot be undone.",
    DELETE_SELECTED_OPTIONS = "Do you really want to delete selected options? This action cannot be undone.",
    SET_INVENTORY_TO_AVAILABLE_FOR_SALE = 'Do you really want to set the inventory to "Available for sale"? This action cannot be undone.',
    DELETE_OPTIONS_AVAILABLE_FOR_SALE = 'Do you really want to delete selected options and set the inventory to "Available for sale"? This action cannot be undone.',
    DELETE_DEAL_AVAILABLE_FOR_SALE = 'Do you really want to delete the deal with all related options you\'ve selected and set the inventory to "Available for sale"? This action cannot be undone.',
}

export enum INCLUDE_OPTIONS {
    COMMISSION1 = "COMMISSION1",
    COMMISSION = "COMMISSION",
}

export const NEW_PAYMENT_LABEL = "new_";
export const EMPTY_PAYMENT_LENGTH = 7;

export class DealStore {
    public rootStore: RootStore;
    private _deal: DealItem = {} as DealItem;
    private _inventory: Inventory = {} as Inventory;
    private _dealExtData: DealExtData = {} as DealExtData;
    private _dealFinance = {} as DealFinance;
    private _dealFinances: DealFinance = {} as DealFinance;
    private _dealWashout: DealWashout = {} as DealWashout;
    private _originalDealWashout: DealWashout = {} as DealWashout;
    private _dealPickupPayments: (DealPickupPayment & { changed?: boolean })[] = [];
    private _dealID: string = "";
    private _dealType: number = 0;
    private _printList: DealPrintCollection = {};
    private _dealErrorMessage: string = "";
    private _accordionActiveIndex: number | number[] = [];
    private _memoRoute: string = "";
    protected _isLoading = false;
    protected _isFormChanged = false;
    private _deleteMessage: string = DEAL_DELETE_MESSAGES.DELETE_DEAL;
    private _deleteReason: string = "";
    private _deleteDealAndRelatedOption: boolean = false;
    private _deleteDealOption: boolean = true;
    private _deleteContactOption: boolean = false;
    private _deleteAccountOption: boolean = false;
    private _deleteInventoryOption: boolean = false;
    private _setInventoryAvailableOption: boolean = false;

    private _dealFirstTradeOverwrite: boolean = false;
    private _dealSecondTradeOverwrite: boolean = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get deal() {
        return this._deal;
    }

    public get inventory() {
        return this._inventory;
    }

    public get dealExtData() {
        return this._dealExtData;
    }

    public get dealFinance() {
        return this._dealFinance;
    }

    public get dealFinances() {
        return this._dealFinances;
    }

    public get dealWashout() {
        return this._dealWashout;
    }

    public get isWashoutChanged() {
        const current = JSON.stringify(this._dealWashout);
        const original = JSON.stringify(this._originalDealWashout);
        return current !== original;
    }

    public get dealType() {
        return this._dealType;
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

    public get memoRoute() {
        return this._memoRoute;
    }

    public get isFormChanged() {
        return this._isFormChanged;
    }

    public get accordionActiveIndex() {
        return this._accordionActiveIndex;
    }

    public get deleteMessage() {
        return this._deleteMessage;
    }

    public get deleteReason() {
        return this._deleteReason;
    }

    public get deleteDealAndRelatedOption() {
        return this._deleteDealAndRelatedOption;
    }

    public get deleteDealOption() {
        return this._deleteDealOption;
    }

    public get deleteContactOption() {
        return this._deleteContactOption;
    }

    public get deleteAccountOption() {
        return this._deleteAccountOption;
    }

    public get deleteInventoryOption() {
        return this._deleteInventoryOption;
    }

    public get setInventoryAvailableOption() {
        return this._setInventoryAvailableOption;
    }

    public get dealFirstTradeOverwrite() {
        return this._dealFirstTradeOverwrite;
    }

    public get dealSecondTradeOverwrite() {
        return this._dealSecondTradeOverwrite;
    }

    public get hasDeleteOptionsSelected() {
        return (
            this._deleteDealAndRelatedOption ||
            this._deleteDealOption ||
            this._deleteContactOption ||
            this._deleteAccountOption ||
            this._deleteInventoryOption ||
            this._setInventoryAvailableOption
        );
    }

    public getDeal = async (itemuid: string) => {
        this._isLoading = true;
        this._dealErrorMessage = "";
        try {
            const response = await getDealInfo(itemuid);
            if (response?.status === Status.OK) {
                const { extdata, finance, ...deal } = response as Deal;
                this._deal = deal;
                this._dealType = deal.dealtype;
                this._dealID = extdata.dealUID;
                this._dealExtData = extdata || ({} as DealExtData);
                this._dealFinance = finance || ({} as DealFinance);
                const inventoryResponse = await getInventoryInfo(deal.inventoryuid);
                if (inventoryResponse?.status === Status.OK) {
                    this._inventory = inventoryResponse as Inventory;
                }
            } else {
                const { error } = response as BaseResponseError;
                this._dealErrorMessage = error!;
                throw error;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isFormChanged = false;
            this._isLoading = false;
        }
    };

    public getDealFinances = async (dealuid: string) => {
        try {
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

    public getDealWashout = async (dealuid: string) => {
        this._isLoading = true;
        try {
            this._dealErrorMessage = "";
            const response = await getDealWashout(dealuid);
            if (response && response.status === Status.OK) {
                this._dealWashout = response as DealWashout;
                this._originalDealWashout = JSON.parse(JSON.stringify(response as DealWashout));
            } else {
                const { error } = response as BaseResponseError;
                this._dealErrorMessage = error!;
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

    public changeDeal = action(({ key, value }: { key: keyof Deal; value: string | number }) => {
        if (this._deal && key !== "extdata" && key !== "finance") {
            this._isFormChanged = true;
            (this._deal as Record<typeof key, string | number>)[key] = value;
        }
    });

    public changeDealExtData = action(
        ({ key, value }: { key: keyof DealExtData; value: string | number }) => {
            const dealStore = this.rootStore.dealStore;
            if (dealStore) {
                this._isFormChanged = true;
                const { dealExtData } = dealStore;
                (dealExtData as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeDealFinance = action(
        ({ key, value }: { key: keyof DealFinance; value: string | number }) => {
            const dealStore = this.rootStore.dealStore;
            if (dealStore) {
                const { dealFinance } = dealStore;
                (dealFinance as Record<typeof key, string | number>)[key] = value;
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

    public changeDealWashout = action((key: keyof DealWashout, value: string | number) => {
        const dealStore = this.rootStore.dealStore;
        if (dealStore) {
            const { dealWashout } = dealStore;
            (dealWashout as Record<typeof key, string | number>)[key] = value;
        }
    });

    public toggleIncludeCheckbox = action((fieldName: string, option: INCLUDE_OPTIONS | null) => {
        const dealStore = this.rootStore.dealStore;
        if (dealStore) {
            const { dealWashout } = dealStore;
            const check1Field = `${fieldName}Check1` as keyof DealWashout;
            const check2Field = `${fieldName}Check2` as keyof DealWashout;

            if (option === INCLUDE_OPTIONS.COMMISSION1) {
                (dealWashout as any)[check1Field] = 1;
                (dealWashout as any)[check2Field] = 0;
            } else if (option === INCLUDE_OPTIONS.COMMISSION) {
                (dealWashout as any)[check1Field] = 0;
                (dealWashout as any)[check2Field] = 1;
            } else {
                (dealWashout as any)[check1Field] = 0;
                (dealWashout as any)[check2Field] = 0;
            }
        }
    });

    public getIncludeCheckboxValue = (fieldName: string): INCLUDE_OPTIONS | null => {
        const dealStore = this.rootStore.dealStore;
        if (dealStore) {
            const { dealWashout } = dealStore;
            const check1Field = `${fieldName}Check1` as keyof DealWashout;
            const check2Field = `${fieldName}Check2` as keyof DealWashout;

            if ((dealWashout as any)[check1Field] === 1) {
                return INCLUDE_OPTIONS.COMMISSION1;
            }
            if ((dealWashout as any)[check2Field] === 1) {
                return INCLUDE_OPTIONS.COMMISSION;
            }
            return null;
        }
        return null;
    };

    public resetWashoutChanges = action(() => {
        this._originalDealWashout = JSON.parse(JSON.stringify(this._dealWashout));
    });

    public changeDealPickupPayments = action(
        (
            itemuid: string,
            {
                key,
                value,
                isNew,
            }: { key: keyof DealPickupPayment; value: string | number; isNew?: boolean }
        ) => {
            this._isFormChanged = true;

            const currentPayment = this._dealPickupPayments.find((p) => p.itemuid === itemuid);
            if (currentPayment) {
                if (key === "paydate") {
                    const date = new Date(value as string);
                    date.setHours(12, 0, 0, 0);
                    currentPayment[key] = date.getTime();
                } else {
                    (currentPayment as Record<typeof key, string | number>)[key] = value;
                }
                currentPayment.changed = true;
            } else if (itemuid.startsWith(NEW_PAYMENT_LABEL)) {
                const newPayment = {
                    itemuid,
                    dealuid: this._dealID,
                    paydate:
                        key === "paydate"
                            ? (() => {
                                  const date = new Date(value as string);
                                  date.setHours(12, 0, 0, 0);
                                  return date.getTime();
                              })()
                            : 0,
                    amount: key === "amount" ? (value as number) : 0,
                    paid: key === "paid" ? (value as number) : 0,
                };
                this._dealPickupPayments = [
                    ...this._dealPickupPayments,
                    { ...newPayment, changed: true } as DealPickupPayment & { changed?: boolean },
                ];
            }
        }
    );

    private filterOutTimestampKeys = (obj: any): any => {
        if (!obj || typeof obj !== "object") return obj;

        return Object.entries(obj).reduce((acc, [key, value]) => {
            if (key !== "created" && key !== "updated") {
                acc[key] = typeof value === "object" ? this.filterOutTimestampKeys(value) : value;
            }
            return acc;
        }, {} as any);
    };

    public saveDeal = action(async (): Promise<string | undefined | BaseResponseError> => {
        try {
            this._isLoading = true;
            const dealData: Deal = {
                ...this.filterOutTimestampKeys(this._deal),
                datepurchase: convertToStandardTimestamp(this._deal.datepurchase),
                dateeffective: convertToStandardTimestamp(this._deal.dateeffective),
                extdata: this.filterOutTimestampKeys(this._dealExtData),
                finance: this.filterOutTimestampKeys(this._dealFinances),
            };
            const dealResponse = await setDeal(this._dealID, dealData).then((response) => {
                if (response?.status === Status.ERROR) {
                    throw response;
                }
                return response;
            });
            const financesResponse = await setDealFinance(this._dealID, this._dealFinances);
            const paymentsResponse = await this._dealPickupPayments
                .filter((item) => item.changed)
                .forEach((item) => {
                    const { itemuid, changed, ...payment } = item;
                    const id = itemuid.startsWith(NEW_PAYMENT_LABEL) ? "0" : itemuid;
                    setDealPayments(this._dealID, { itemuid: id, ...payment });
                });
            await Promise.race([dealResponse, financesResponse, paymentsResponse]).then(
                (response) => (response ? this._dealID : undefined)
            );
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 500) {
                const responseData = error?.response?.data as BaseResponseError;
                return {
                    status: Status.ERROR,
                    error: responseData?.error,
                    errors: responseData?.errors,
                };
            } else {
                const err = error as BaseResponseError;
                return err;
            }
        } finally {
            this._isLoading = false;
        }
    });

    public getPrintList = action(async (dealuid = this._dealID) => {
        try {
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
            this._dealErrorMessage = "";
            const response = await getDealPayments(dealuid);
            if (Array.isArray(response)) {
                const emptyPayments = Array.from(
                    { length: Math.max(0, EMPTY_PAYMENT_LENGTH - response.length) },
                    (_, index) =>
                        ({
                            itemuid: `${NEW_PAYMENT_LABEL}${index}`,
                            dealuid: this._dealID,
                            paydate: 0,
                            amount: 0,
                            paid: 0,
                        }) as DealPickupPayment
                );
                this._dealPickupPayments = [...response, ...emptyPayments];
            } else {
                this._dealErrorMessage = response.error as string;
            }
        } finally {
            this._isLoading = false;
        }
    });

    public changeAddToInventory = action((value: AddToInventory) => {
        this._isFormChanged = true;
        switch (value) {
            case AddToInventory.ALL_DISABLED:
                this._deal.addToInventory = AddToInventory.ALL_DISABLED;
                break;
            case AddToInventory.TRADE_FIRST_ENABLED:
                this._deal.addToInventory = AddToInventory.TRADE_FIRST_ENABLED;
                break;
            case AddToInventory.TRADE_SECOND_ENABLED:
                this._deal.addToInventory = AddToInventory.TRADE_SECOND_ENABLED;
                break;
            default:
                this._deal.addToInventory = AddToInventory.ALL_ENABLED;
                break;
        }
    });

    public set dealType(type: number) {
        this._dealType = type;
    }

    public set accordionActiveIndex(index: number | number[]) {
        this._accordionActiveIndex = index;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set memoRoute(state: string) {
        this._memoRoute = state;
    }

    public set deleteMessage(message: string) {
        this._deleteMessage = message;
    }

    public set deleteReason(reason: string) {
        this._deleteReason = reason;
    }

    public set deleteDealAndRelatedOption(value: boolean) {
        this._deleteDealAndRelatedOption = value;
    }

    public set deleteDealOption(value: boolean) {
        this._deleteDealOption = value;
    }

    public set deleteContactOption(value: boolean) {
        this._deleteContactOption = value;
    }

    public set deleteAccountOption(value: boolean) {
        this._deleteAccountOption = value;
    }

    public set deleteInventoryOption(value: boolean) {
        this._deleteInventoryOption = value;
    }

    public set setInventoryAvailableOption(value: boolean) {
        this._setInventoryAvailableOption = value;
    }

    public set isFormChanged(value: boolean) {
        this._isFormChanged = value;
    }

    public set dealFirstTradeOverwrite(value: boolean) {
        this._dealFirstTradeOverwrite = value;
    }

    public set dealSecondTradeOverwrite(value: boolean) {
        this._dealSecondTradeOverwrite = value;
    }

    public clearDeal = () => {
        this._deal = {} as DealItem;
        this._dealErrorMessage = "";
        this._dealID = "";
        this._deleteReason = "";
        this._dealExtData = {} as DealExtData;
        this._dealFinance = {} as DealFinance;
        this._dealFinances = {} as DealFinance;
        this._dealWashout = {} as DealWashout;
        this._printList = {} as DealPrintCollection;
        this._dealPickupPayments = [] as DealPickupPayment[];
    };
}
