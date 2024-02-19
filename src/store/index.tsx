import { configure } from "mobx";
import { InventoryStore } from "./stores/inventory";
import { ContactStore } from "./stores/contact";

configure({
    enforceActions: "never",
});

export class RootStore {
    public inventoryStore: InventoryStore;
    public contactStore: ContactStore;
    public constructor() {
        this.inventoryStore = new InventoryStore(this);
        this.contactStore = new ContactStore(this);
    }
}

export const store = new RootStore();
