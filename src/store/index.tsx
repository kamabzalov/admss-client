import {
    Inventory,
    InventoryExtData,
    InventoryOptionsInfo,
    getInventoryInfo,
    getInventoryMediaItemList,
} from "http/services/inventory-service";
import { action, configure, makeAutoObservable } from "mobx";

configure({
    enforceActions: "never",
});

export class RootStore {
    public inventoryStore: InventoryStore;
    public constructor() {
        this.inventoryStore = new InventoryStore(this);
    }
}

class InventoryStore {
    public rootStore: RootStore;
    private _inventory: Inventory = {} as Inventory;
    private _inventoryOptions: InventoryOptionsInfo[] = [];
    private _inventoryExtData: InventoryExtData = {} as InventoryExtData;
    private _inventoryImagesID: string[] = [];
    private _inventoryVideoID: string[] = [];
    private _inventoryAudioID: string[] = [];
    private _inventoryDocumentsID: string[] = [];
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get inventory() {
        return this._inventory;
    }
    public get inventoryOptions() {
        return this._inventoryOptions;
    }
    public get inventoryExtData() {
        return this._inventoryExtData;
    }
    public get inventoryImages() {
        return this._inventoryImagesID;
    }
    public get isLoading() {
        return this._isLoading;
    }

    public getInventory = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                const { extdata, options_info, ...inventory } = response;
                this._inventory = inventory || ({} as Inventory);
                this._inventoryOptions = options_info || [];
                this._inventoryExtData = extdata || ({} as InventoryExtData);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getInventoryMedia = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryMediaItemList(itemuid);
            if (response) {
                response.forEach(({ contenttype, mediauid }) => {
                    switch (contenttype) {
                        case 0:
                            this._inventoryImagesID.push(mediauid);
                            break;
                        case 1:
                            this._inventoryVideoID.push(mediauid);
                            break;
                        case 2:
                            this._inventoryAudioID.push(mediauid);
                            break;
                        case 3:
                            this._inventoryDocumentsID.push(mediauid);
                            break;

                        default:
                            break;
                    }
                });
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public changeInventory = action(
        ({ key, value }: { key: keyof Inventory; value: string | number }) => {
            if (this._inventory && key !== "extdata" && key !== "options_info") {
                (this._inventory as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeInventoryExtData = action(
        ({ key, value }: { key: keyof InventoryExtData; value: string | number }) => {
            const inventoryStore = this.rootStore.inventoryStore;
            if (inventoryStore) {
                const { inventoryExtData } = inventoryStore;
                (inventoryExtData as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeInventoryOptions = action((optionName: InventoryOptionsInfo) => {
        const inventoryStore = this.rootStore.inventoryStore;
        if (inventoryStore) {
            const { inventoryOptions } = inventoryStore;

            if (inventoryOptions.includes(optionName)) {
                const updatedOptions = inventoryOptions.filter((option) => option !== optionName);
                inventoryStore._inventoryOptions = updatedOptions;
            } else {
                inventoryStore._inventoryOptions.push(optionName);
            }
        }
    });

    public clearInventory = () => {
        this._inventory = {} as Inventory;
        this._inventoryOptions = [];
        this._inventoryExtData = {} as InventoryExtData;
        this._inventoryImagesID = [];
    };

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }
}

export const store = new RootStore();
