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
    public inventory: Inventory = {} as Inventory;
    public inventoryOptions: InventoryOptionsInfo[] = [];
    public inventoryExtData: InventoryExtData = {} as InventoryExtData;
    public isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    getInventory = async (itemuid: string) => {
        this.isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                const { extdata, options_info, ...inventory } = response;
                this.rootStore.inventoryStore.inventory = inventory || ({} as Inventory);
                this.rootStore.inventoryStore.inventoryOptions = options_info || [];
                this.rootStore.inventoryStore.inventoryExtData =
                    extdata || ({} as InventoryExtData);
                this.rootStore.inventoryStore.isLoading = false;
            }
        } catch (error) {
            this.rootStore.inventoryStore.isLoading = false;
        }
    };

    changeInventory = action(({ key, value }: { key: keyof Inventory; value: string | number }) => {
        if (
            this.rootStore.inventoryStore.inventory &&
            key !== "extdata" &&
            key !== "options_info"
        ) {
            (this.rootStore.inventoryStore.inventory as Record<typeof key, string | number>)[key] =
                value;
        }
    });

    changeInventoryExtData = action(
        ({ key, value }: { key: keyof InventoryExtData; value: string | number }) => {
            const inventoryStore = this.rootStore.inventoryStore;
            if (inventoryStore) {
                const { inventoryExtData } = inventoryStore;
                (inventoryExtData as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    changeInventoryOptions = action((optionName: InventoryOptionsInfo) => {
        const inventoryStore = this.rootStore.inventoryStore;
        if (inventoryStore) {
            const { inventoryOptions } = inventoryStore;

            if (inventoryOptions.includes(optionName)) {
                const updatedOptions = inventoryOptions.filter((option) => option !== optionName);
                inventoryStore.inventoryOptions = updatedOptions;
            } else {
                inventoryStore.inventoryOptions.push(optionName);
            }
        }
    });

    clearInventory = () => (this.rootStore.inventoryStore.inventory = initialInventoryState);
}

export const store = new RootStore();
