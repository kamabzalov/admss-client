import { configure } from "mobx";
import { InventoryStore } from "./stores/inventory";
import { ContactStore } from "./stores/contact";
import { DealStore } from "./stores/deal";

configure({
    enforceActions: "never",
});

export class RootStore {
    public inventoryStore: InventoryStore;
    public contactStore: ContactStore;
    public dealStore: DealStore;
    public constructor() {
        this.inventoryStore = new InventoryStore(this);
        this.contactStore = new ContactStore(this);
        this.dealStore = new DealStore(this);
    }
}

export const store = new RootStore();
