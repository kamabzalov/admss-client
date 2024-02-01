import { Status } from "common/models/base-response";
import {
    Inventory,
    InventoryExtData,
    InventoryOptionsInfo,
    createMediaItemRecord,
    getInventoryInfo,
    getInventoryMediaItemList,
    pairMediaWithInventoryItem,
    setInventory,
    uploadInventoryMedia,
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
    private _inventoryID: string = "";
    private _inventoryOptions: InventoryOptionsInfo[] = [];
    private _inventoryExtData: InventoryExtData = {} as InventoryExtData;
    private _inventoryImagesID: string[] = [];
    private _inventoryVideoID: string[] = [];
    private _inventoryAudioID: string[] = [];
    private _inventoryDocumentsID: string[] = [];
    private _fileImages: File[] = [];
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
    public get inventoryImagesID() {
        return this._inventoryImagesID;
    }
    public get fileImages() {
        return this._fileImages;
    }
    public get isLoading() {
        return this._isLoading;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public getInventory = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                const { extdata, options_info, ...inventory } = response;
                this._inventoryID = response.itemuid;
                this._inventory = inventory || ({} as Inventory);
                this._inventoryOptions = options_info || [];
                this._inventoryExtData = extdata || ({} as InventoryExtData);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getInventoryMedia = async (itemuid: string = this._inventoryID) => {
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

    public saveInventory = action(async (): Promise<string | undefined> => {
        try {
            const response = await setInventory(this._inventoryID, this._inventory);
            if (response?.status === Status.OK) return response.itemuid;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        }
    });

    public saveInventoryImages = action(async (): Promise<Status | undefined> => {
        try {
            this._isLoading = true;

            const uploadPromises = this._fileImages.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);

                try {
                    const createMediaResponse = await createMediaItemRecord();
                    if (createMediaResponse?.status === Status.OK) {
                        const uploadMediaResponse = await uploadInventoryMedia(
                            createMediaResponse.itemUID,
                            formData
                        );
                        if (uploadMediaResponse?.status === Status.OK) {
                            await pairMediaWithInventoryItem(
                                this._inventoryID,
                                uploadMediaResponse.itemuid
                            );
                            this._inventoryImagesID.push(uploadMediaResponse.itemuid);
                        }
                    }
                } catch (error) {
                    // TODO: add error handler
                }
            });

            await Promise.all(uploadPromises);

            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public set fileImages(files: File[]) {
        this._fileImages = files;
    }

    public set inventoryImagesID(images: string[]) {
        this._inventoryImagesID = images;
    }

    public clearInventory = () => {
        this._inventory = {} as Inventory;
        this._inventoryOptions = [];
        this._inventoryExtData = {} as InventoryExtData;
        this._inventoryImagesID = [];
    };
}

export const store = new RootStore();
