import { makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class UsersStore {
    public rootStore: RootStore;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }
}
