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

export interface MediaItem {
    src: string;
    itemuid: string;
    mediauid?: string;
    info?: Partial<InventoryMedia> & {
        order?: number;
    };
}

interface UploadMediaItem {
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
    private _uploadFileImages: UploadMediaItem = {} as UploadMediaItem;
    private _images: MediaItem[] = [];

    private _inventoryVideoID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileVideos: UploadMediaItem = {} as UploadMediaItem;
    private _videos: MediaItem[] = [];

    private _inventoryAudioID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileAudios: UploadMediaItem = {} as UploadMediaItem;
    private _audios: MediaItem[] = [];

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
    public get images() {
        return this._images;
    }
    public get uploadFileVideos() {
        return this._uploadFileVideos;
    }
    public get videos() {
        return this._videos;
    }
    public get uploadFileAudios() {
        return this._uploadFileAudios;
    }
    public get audios() {
        return this._audios;
    }

    public get inventoryExportWebHistory() {
        return this._exportWebHistory;
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
                                this._inventoryVideoID.push({ itemuid, mediauid });
                                this._videos.push({
                                    src: "",
                                    itemuid,
                                    info,
                                });
                                break;
                            case MediaType.mtAudio:
                                this._audios.push({
                                    src: "",
                                    itemuid,
                                    info,
                                });
                                this._inventoryAudioID.push({ itemuid, mediauid });
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

    private saveInventoryMedia = action(
        async (mediaType: MediaType): Promise<Status | undefined> => {
            try {
                this._isLoading = true;
                const currentMt = new Map([
                    [MediaType.mtPhoto, this._uploadFileImages],
                    [MediaType.mtVideo, this._uploadFileVideos],
                    [MediaType.mtAudio, this._uploadFileAudios],
                ]);
                const uploadPromises = (currentMt.get(mediaType) || { file: [] }).file.map(
                    async (file) => {
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                            const createMediaResponse = await createMediaItemRecord(mediaType);
                            if (createMediaResponse?.status === Status.OK) {
                                const uploadMediaResponse = await uploadInventoryMedia(
                                    createMediaResponse.itemUID,
                                    formData
                                );
                                if (uploadMediaResponse?.status === Status.OK) {
                                    await setMediaItemData(this._inventoryID, {
                                        mediaitemuid: uploadMediaResponse.itemuid,
                                        contenttype: (currentMt.get(mediaType) as UploadMediaItem)
                                            .data.contenttype,
                                        notes: (currentMt.get(mediaType) as UploadMediaItem).data
                                            .notes,
                                    });
                                }
                            }
                        } catch (error) {
                            // TODO: add error handler
                        }
                    }
                );

                await Promise.all(uploadPromises);

                return Status.OK;
            } catch (error) {
                // TODO: add error handler
                return undefined;
            } finally {
                this._isLoading = false;
            }
        }
    );

    public saveInventoryImages = action(async (): Promise<Status | undefined> => {
        try {
            this._images = [];
            await this.saveInventoryMedia(MediaType.mtPhoto);
            this._uploadFileImages = {} as UploadMediaItem;
            this.fetchImages();
            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        }
    });
    public saveInventoryVideos = action(async (): Promise<Status | undefined> => {
        try {
            this._videos = [];
            await this.saveInventoryMedia(MediaType.mtVideo);
            this._uploadFileVideos = {} as UploadMediaItem;
            this.fetchImages();
            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        }
    });
    public saveInventoryAudios = action(async (): Promise<Status | undefined> => {
        try {
            this._audios = [];
            await this.saveInventoryMedia(MediaType.mtAudio);
            this._uploadFileAudios = {} as UploadMediaItem;
            this.fetchImages();
            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
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

    private async fetchMedia(
        mediaType: MediaType,
        mediaArray: MediaItem[],
        inventoryMediaID: Partial<InventoryMediaItemID>[]
    ) {
        try {
            this._isLoading = true;
            await this.getInventoryMedia();

            const result: MediaItem[] = [...mediaArray];

            await Promise.all(
                inventoryMediaID.map(async ({ mediauid, itemuid }, index: number) => {
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

            if (mediaType === MediaType.mtPhoto) {
                this._images = result;
            } else if (mediaType === MediaType.mtVideo) {
                this._videos = result;
            } else if (mediaType === MediaType.mtAudio) {
                this._audios = result;
            }
        } catch (error) {
            // TODO: add error handler
        } finally {
            this._isLoading = false;
        }
    }

    public fetchImages = action(async () => {
        this._images = [];
        this._inventoryImagesID = [];
        await this.fetchMedia(MediaType.mtPhoto, this._images, this._inventoryImagesID);
    });

    public fetchVideos = action(async () => {
        this._videos = [];
        this._inventoryVideoID = [];
        await this.fetchMedia(MediaType.mtVideo, this._videos, this._inventoryVideoID);
    });

    public fetchAudios = action(async () => {
        this._audios = [];
        this._inventoryAudioID = [];
        await this.fetchMedia(MediaType.mtAudio, this._audios, this._inventoryAudioID);
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

    public removeMedia = action(async (imageuid: string): Promise<Status | undefined> => {
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

    public set uploadFileImages(files: UploadMediaItem) {
        this._uploadFileImages = files;
    }

    public set uploadFileVideos(files: UploadMediaItem) {
        this._uploadFileVideos = files;
    }

    public set uploadFileAudios(files: UploadMediaItem) {
        this._uploadFileAudios = files;
    }

    public clearInventory = () => {
        this._inventory = {} as Inventory;
        this._inventoryOptions = [];
        this._inventoryExtData = {} as InventoryExtData;
        this._inventoryImagesID = [];
        this._images = [];
        this._inventoryVideoID = [];
        this._videos = [];
        this._inventoryAudioID = [];
        this._audios = [];
        this._exportWeb = {} as InventoryWebInfo;
        this._exportWebHistory = [] as InventoryExportWebHistory[];
        this._printList = [] as InventoryPrintForm[];
    };
}
