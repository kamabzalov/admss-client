import { configure } from "mobx";
import { InventoryStore } from "./stores/inventory";
import { ContactStore } from "./stores/contact";
import { DealStore } from "./stores/deal";
import { UserStore } from "./stores/user";
import { AccountStore } from "./stores/account";

configure({
    enforceActions: "never",
});

export class RootStore {
    public inventoryStore: InventoryStore;
    public contactStore: ContactStore;
    public dealStore: DealStore;
    public userStore: UserStore;
    public accountStore: AccountStore;
    public constructor() {
        this.userStore = new UserStore(this);
        this.inventoryStore = new InventoryStore(this);
        this.contactStore = new ContactStore(this);
        this.dealStore = new DealStore(this);
        this.accountStore = new AccountStore(this);
    }
}

export const store = new RootStore();
