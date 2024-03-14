import { AccountPayment } from "common/models/accounts";
import { Status } from "common/models/base-response";
import { MediaType } from "common/models/enums";
import {
    Inventory,
    InventoryOptionsInfo,
    InventoryExtData,
    InventoryMediaItemID,
    InventoryWebInfo,
    InventoryExportWebHistory,
    InventoryPrintForm,
    Audit,
    InventoryMediaPostData,
    InventoryMedia,
} from "common/models/inventory";
import { getAccountPayment } from "http/services/accounts.service";
import {
    getInventoryInfo,
    setInventory,
    getInventoryWebInfo,
    getInventoryWebInfoHistory,
    getInventoryPrintForms,
    setInventoryExportWeb,
} from "http/services/inventory-service";
import {
    getInventoryMediaItemList,
    createMediaItemRecord,
    uploadInventoryMedia,
    setMediaItemData,
    getInventoryMediaItem,
    deleteMediaImage,
} from "http/services/media.service";
import { makeAutoObservable, action } from "mobx";
import { RootStore } from "store";

export interface ImageItem {
    src: string;
    itemuid: string;
    mediauid?: string;
    info?: Partial<InventoryMedia> & {
        order?: number;
    };
}

interface UploadImageItem {
    file: File[];
    data: Partial<InventoryMediaPostData>;
}

export class InventoryStore {
    public rootStore: RootStore;
    private _inventory: Inventory = {} as Inventory;
    private _inventoryID: string = "";
    private _inventoryOptions: InventoryOptionsInfo[] = [];
    private _inventoryExtData: InventoryExtData = {} as InventoryExtData;
    private _inventoryPayments: AccountPayment = {} as AccountPayment;
    private _inventoryAudit: Audit = {} as Audit;

    private _exportWebActive: boolean = false;
    private _exportWeb: InventoryWebInfo = {} as InventoryWebInfo;
    private _exportWebHistory: InventoryExportWebHistory[] = [];

    private _inventoryImagesID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileImages: UploadImageItem = {} as UploadImageItem;
    private _images: ImageItem[] = [];

    private _inventoryVideoID: string[] = [];
    private _inventoryAudioID: string[] = [];
    private _inventoryDocumentsID: string[] = [];

    private _printList: InventoryPrintForm[] = [];

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
    public get inventoryAudit() {
        return this._inventoryAudit;
    }
    public get inventoryExtData() {
        return this._inventoryExtData;
    }
    public get inventoryPayments() {
        return this._inventoryPayments;
    }
    public get inventoryExportWeb() {
        return this._exportWeb;
    }
    public get exportWebActive() {
        return this._exportWebActive;
    }
    public get uploadFileImages() {
        return this._uploadFileImages;
    }
    public get inventoryExportWebHistory() {
        return this._exportWebHistory;
    }
    public get images() {
        return this._images;
    }

    public get printList() {
        return this._printList;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public set exportWebActive(state: boolean) {
        this._exportWebActive = state;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public getInventory = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                const { extdata, options_info, Audit, ...inventory } = response;
                this._inventoryID = response.itemuid;
                this._inventory =
                    { ...inventory, Make: inventory.Make.toUpperCase() } || ({} as Inventory);
                this._inventoryOptions = options_info || [];

                this._inventoryExtData = extdata || ({} as InventoryExtData);
                this._inventoryAudit = Audit || ({} as Audit);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    private getInventoryMedia = async (): Promise<Status> => {
        this._isLoading = true;
        try {
            const response = await getInventoryMediaItemList(this._inventoryID);
            if (response && response.length > 0) {
                response.forEach(({ type, mediauid, itemuid, ...info }) => {
                    if (mediauid) {
                        switch (type) {
                            case MediaType.mtPhoto:
                                this._inventoryImagesID.push({ itemuid, mediauid });
                                this._images.push({
                                    src: "",
                                    itemuid,
                                    info,
                                });
                                break;
                            case MediaType.mtVideo:
                                this._inventoryVideoID.push(mediauid);
                                break;
                            case MediaType.mtAudio:
                                this._inventoryAudioID.push(mediauid);
                                break;
                            case MediaType.mtDocument:
                                this._inventoryDocumentsID.push(mediauid);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }

            return Status.OK;
        } catch (error) {
            return Status.ERROR;
        } finally {
            this._isLoading = false;
        }
    };

    public getInventoryExportWeb = async (id = this._inventoryID): Promise<void> => {
        this._isLoading = true;
        try {
            const response = await getInventoryWebInfo(id);
            if (response) {
                this._exportWeb = response;
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getInventoryPayments = async (id = this._inventoryID): Promise<void> => {
        this._isLoading = true;
        try {
            const response = await getAccountPayment(id);
            if (response) {
                this._inventoryPayments = response;
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public getInventoryExportWebHistory = async (id = this._inventoryID): Promise<void> => {
        this._isLoading = true;
        try {
            const response = await getInventoryWebInfoHistory(id);
            if (response) {
                this._exportWebHistory = response;
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    };

    public changeInventory = action(
        ({ key, value }: { key: keyof Inventory; value: string | number }) => {
            if (this._inventory && key !== "extdata" && key !== "options_info" && key !== "Audit") {
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

    public changeInventoryAudit = action((key: keyof Audit) => {
        const inventoryStore = this.rootStore.inventoryStore;
        if (inventoryStore) {
            const { inventoryAudit } = inventoryStore;
            const newValue = !!inventoryAudit[key] ? 0 : 1;
            (inventoryAudit as Record<typeof key, string | number>)[key] = newValue;
        }
    });

    public changeExportWeb = action(
        ({ key, value }: { key: keyof InventoryWebInfo; value: string | number }) => {
            const inventoryStore = this.rootStore.inventoryStore;
            if (inventoryStore) {
                const { inventoryExportWeb } = inventoryStore;
                (inventoryExportWeb as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public saveInventory = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;
            const inventoryData: Inventory = {
                ...this.inventory,
                extdata: {
                    ...this.inventoryExtData,
                    fpReduxAmt: this.inventoryExtData?.fpReduxAmt * 100,
                    fpRemainBal: this.inventoryExtData?.fpRemainBal * 100,
                    csFee: this.inventoryExtData?.csFee * 100,
                    csReserveAmt: this.inventoryExtData?.csReserveAmt * 100,
                    csEarlyRemoval: this.inventoryExtData?.csEarlyRemoval * 100,
                    csListingFee: this.inventoryExtData?.csListingFee * 100,
                    csOwnerAskingPrice: this.inventoryExtData?.csOwnerAskingPrice * 100,
                    purPurchaseBuyerComm: this.inventoryExtData?.purPurchaseBuyerComm * 100,
                    purPurchaseAmount: this.inventoryExtData?.purPurchaseAmount * 100,
                },
                options_info: this.inventoryOptions,
                Audit: this.inventoryAudit,
            };
            const inventoryResponse = await setInventory(this._inventoryID, inventoryData);
            if (!this.exportWebActive) {
                return inventoryResponse?.status === Status.OK ? this._inventoryID : undefined;
            }
            const webResponse = await setInventoryExportWeb(this._inventoryID, this._exportWeb);

            await Promise.all([inventoryResponse, webResponse]).then((response) =>
                response.every((item) => item?.status === Status.OK) ? this._inventoryID : undefined
            );
        } catch (error) {
            // TODO: add error handlers
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public saveInventoryImages = action(async (): Promise<Status | undefined> => {
        try {
            this._isLoading = true;
            this._images = [];
            const uploadPromises = this._uploadFileImages.file.map(async (file) => {
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
                            await setMediaItemData(this._inventoryID, {
                                mediaitemuid: uploadMediaResponse.itemuid,
                                contenttype: this._uploadFileImages.data.contenttype,
                                notes: this._uploadFileImages.data.notes,
                            });
                        }
                    }
                } catch (error) {
                    // TODO: add error handler
                }
            });

            await Promise.all(uploadPromises);
            this._uploadFileImages = {} as UploadImageItem;
            this.fetchImages();

            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public changeInventoryMediaOrder = action(
        (list: Pick<InventoryMediaPostData, "itemuid" | "order">[]) => {
            list.forEach(async ({ itemuid, order }) => {
                const currentMedia = this._images.find((image) => image.itemuid === itemuid);
                if (currentMedia?.mediauid && currentMedia?.info) {
                    await setMediaItemData(this._inventoryID, {
                        mediaitemuid: currentMedia?.mediauid,
                        ...currentMedia.info,
                        itemuid,
                        order,
                    });
                }
            });
        }
    );

    public fetchImages = action(async () => {
        try {
            this._isLoading = true;
            this._inventoryImagesID = [];
            await this.getInventoryMedia();

            const result: ImageItem[] = [...this._images];

            await Promise.all(
                this._inventoryImagesID.map(async ({ mediauid, itemuid }, index: number) => {
                    if (mediauid && itemuid) {
                        const responseSrc = await getInventoryMediaItem(mediauid);

                        if (responseSrc) {
                            result[index] = {
                                info: result[index].info,
                                itemuid,
                                mediauid,
                                src: responseSrc,
                            };
                        }
                    }
                })
            );

            this._images = result;
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    });

    public getPrintList = action(async (inventoryuid = this._inventoryID) => {
        try {
            this._isLoading = true;
            const response = await getInventoryPrintForms(inventoryuid);
            if (response) {
                this._printList = response;
            }
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    });

    public removeImage = action(async (imageuid: string): Promise<Status | undefined> => {
        try {
            this._isLoading = true;
            try {
                await deleteMediaImage(imageuid);
                this._images = [];
                await this.fetchImages();
            } catch (error) {
                // TODO: add error handler
            }

            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public set uploadFileImages(files: UploadImageItem) {
        this._uploadFileImages = files;
    }

    public clearInventory = () => {
        this._inventory = {} as Inventory;
        this._inventoryOptions = [];
        this._inventoryExtData = {} as InventoryExtData;
        this._inventoryImagesID = [];
        this._images = [];
        this._exportWeb = {} as InventoryWebInfo;
        this._exportWebHistory = [] as InventoryExportWebHistory[];
        this._printList = [] as InventoryPrintForm[];
    };
}
