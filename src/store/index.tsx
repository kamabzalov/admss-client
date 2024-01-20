import {
    Inventory,
    InventoryExtData,
    InventoryOptionsInfo,
    getInventoryInfo,
    initialInventoryState,
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
    public get isLoading() {
        return this._isLoading;
    }

    public getInventory = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                const { extdata, options_info, ...inventory } = response;
                this.rootStore.inventoryStore._inventory = inventory || ({} as Inventory);
                this.rootStore.inventoryStore._inventoryOptions = options_info || [];
                this.rootStore.inventoryStore._inventoryExtData =
                    extdata || ({} as InventoryExtData);
                this.rootStore.inventoryStore._isLoading = false;
            }
        } catch (error) {
            this.rootStore.inventoryStore._isLoading = false;
        }
    };

    public changeInventory = action(
        ({ key, value }: { key: keyof Inventory; value: string | number }) => {
            if (
                this.rootStore.inventoryStore._inventory &&
                key !== "extdata" &&
                key !== "options_info"
            ) {
                (this.rootStore.inventoryStore._inventory as Record<typeof key, string | number>)[
                    key
                ] = value;
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

    public clearInventory = () =>
        (this.rootStore.inventoryStore._inventory = initialInventoryState);

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }
}

export const store = new RootStore();
