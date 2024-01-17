import {
    Inventory,
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
    public inventory: Inventory = initialInventoryState;
    public isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    getInventory = async (itemuid: string) => {
        this.isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            this.rootStore.inventoryStore.inventory = response || initialInventoryState;
            this.rootStore.inventoryStore.isLoading = false;
        } catch (error) {
            this.rootStore.inventoryStore.isLoading = false;
        }
    };

    changeInventory = action(({ key, value }: { key: keyof Inventory; value: string | number }) => {
        if (this.rootStore.inventoryStore.inventory) {
            //@ts-ignore
            this.rootStore.inventoryStore.inventory[key] = value;
        }
    });

    clearInventory = () => (this.rootStore.inventoryStore.inventory = initialInventoryState);
}

export const store = new RootStore();
