import { configure } from "mobx";
import { InventoryStore } from "./stores/inventory";
import { ContactStore } from "./stores/contact";
import { DealStore } from "./stores/deal";
import { UserStore } from "./stores/user";
import { AccountStore } from "./stores/account";
import { ReportStore } from "./stores/report";

configure({
    enforceActions: "never",
});

export class RootStore {
    public inventoryStore: InventoryStore;
    public contactStore: ContactStore;
    public dealStore: DealStore;
    public userStore: UserStore;
    public accountStore: AccountStore;
    public reportStore: ReportStore;
    public constructor() {
        this.userStore = new UserStore(this);
        this.inventoryStore = new InventoryStore(this);
        this.contactStore = new ContactStore(this);
        this.dealStore = new DealStore(this);
        this.accountStore = new AccountStore(this);
        this.reportStore = new ReportStore(this);
    }
}

export const store = new RootStore();
