import { AccountPayment } from "common/models/accounts";
import { BaseResponseError, Status } from "common/models/base-response";
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

const initialMediaItem: UploadMediaItem = {
    file: [],
    data: {
        contenttype: MediaType.mtUnknown,
        notes: "",
    },
};

const initialAuditState: Partial<Audit> = {
    DataNeedsUpdate: 0,
    NeedsCleaning: 0,
    ReadyForSale: 0,
    JustArrived: 0,
};

export class InventoryStore {
    public rootStore: RootStore;
    private _inventory: Inventory = {} as Inventory;
    private _inventoryID: string = "";
    private _inventoryOptions: InventoryOptionsInfo[] = [];
    private _inventoryExtData: InventoryExtData = {} as InventoryExtData;
    private _inventoryPayments: AccountPayment = {} as AccountPayment;
    private _inventoryAudit: Audit = initialAuditState as Audit;

    private _exportWebActive: boolean = false;
    private _exportWeb: InventoryWebInfo = {} as InventoryWebInfo;
    private _exportWebHistory: InventoryExportWebHistory[] = [];

    private _inventoryImagesID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileImages: UploadMediaItem = initialMediaItem;
    private _images: MediaItem[] = [];

    private _inventoryVideoID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileVideos: UploadMediaItem = initialMediaItem;
    private _videos: MediaItem[] = [];

    private _inventoryAudioID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileAudios: UploadMediaItem = initialMediaItem;
    private _audios: MediaItem[] = [];

    private _inventoryDocumentsID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileDocuments: UploadMediaItem = initialMediaItem;
    private _documents: MediaItem[] = [];

    private _printList: InventoryPrintForm[] = [];
    private _formErrorIndex: number[] = [];
    private _currentLocation: string = "";
    private _deleteReason: string = "";

    protected _isLoading: boolean = false;
    protected _isFormChanged: boolean = false;
    protected _formErrorMessage: string = "";

    private _cachedInventory: Inventory = {} as Inventory;

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
    public get uploadFileDocuments() {
        return this._uploadFileDocuments;
    }
    public get documents() {
        return this._documents;
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

    public get isFormChanged() {
        return this._isFormChanged;
    }

    public get formErrorIndex(): number[] {
        return this._formErrorIndex;
    }

    public get formErrorMessage() {
        return this._formErrorMessage;
    }

    public get currentLocation() {
        return this._currentLocation;
    }

    public get deleteReason() {
        return this._deleteReason;
    }

    public getInventory = async (itemuid: string) => {
        this._isLoading = true;
        try {
            const response = await getInventoryInfo(itemuid);
            if (response) {
                this._inventoryID = response.itemuid;
                const { extdata, options_info, Audit, ...inventory } = response;
                this._inventory =
                    { ...inventory, Make: inventory.Make.toUpperCase() } || ({} as Inventory);

                this._inventoryOptions = options_info || [];

                this._inventoryExtData = extdata || ({} as InventoryExtData);
                this._inventoryAudit = Audit || (initialAuditState as Audit);
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
            this._isFormChanged = false;
        }
    };

    public getCachedInventory = () => {
        const { extdata, options_info, Audit, ...inventory } = this._cachedInventory;
        this._inventory = inventory || ({} as Inventory);
        this._inventoryOptions = options_info || [];
        this._inventoryExtData = extdata || ({} as InventoryExtData);
        this._inventoryAudit = Audit || (initialAuditState as Audit);
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
                                this.documents.push({
                                    src: "",
                                    itemuid,
                                    info,
                                });
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
                this._isFormChanged = true;
                (this._inventory as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeInventoryExtData = action(
        ({ key, value }: { key: keyof InventoryExtData; value: string | number }) => {
            const inventoryStore = this.rootStore.inventoryStore;
            if (inventoryStore) {
                this._isFormChanged = true;
                const { inventoryExtData } = inventoryStore;
                (inventoryExtData as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public changeInventoryOptions = action((optionName: InventoryOptionsInfo) => {
        const inventoryStore = this.rootStore.inventoryStore;
        if (inventoryStore) {
            this._isFormChanged = true;
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
            this._isFormChanged = true;
            const newValue = !!inventoryAudit[key] ? 0 : 1;
            (inventoryAudit as Record<typeof key, string | number>)[key] = newValue;
        }
    });

    public changeExportWeb = action(
        ({ key, value }: { key: keyof InventoryWebInfo; value: string | number }) => {
            const inventoryStore = this.rootStore.inventoryStore;
            if (inventoryStore) {
                const { inventoryExportWeb } = inventoryStore;
                this._isFormChanged = true;
                (inventoryExportWeb as Record<typeof key, string | number>)[key] = value;
            }
        }
    );

    public saveInventory = action(
        async (inventoryuid: string = "0"): Promise<string | undefined> => {
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
                const webResponse = await setInventoryExportWeb(inventoryuid, this._exportWeb);
                const inventoryResponse = await setInventory(inventoryuid, inventoryData);
                await Promise.all([inventoryResponse, webResponse]).then((response) =>
                    response.every((item) => item?.status === Status.OK) ? inventoryuid : undefined
                );
            } catch (error) {
                // TODO: add error handlers
                return undefined;
            } finally {
                this._isLoading = false;
            }
        }
    );

    private saveInventoryMedia = action(
        async (mediaType: MediaType): Promise<Status | undefined> => {
            try {
                this._isLoading = true;
                const currentMt = new Map([
                    [MediaType.mtPhoto, this._uploadFileImages],
                    [MediaType.mtVideo, this._uploadFileVideos],
                    [MediaType.mtAudio, this._uploadFileAudios],
                    [MediaType.mtDocument, this._uploadFileDocuments],
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
                                        type: mediaType,
                                    }).then((response) => {
                                        if (response?.status === Status.ERROR) {
                                            const { error } = response as BaseResponseError;
                                            this._formErrorMessage =
                                                error || "Failed to upload file";
                                        }
                                    });
                                }
                            }
                        } finally {
                            this._isLoading = false;
                            this._formErrorMessage = "";
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
            this._uploadFileImages = initialMediaItem;
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
            this._uploadFileVideos = initialMediaItem;
            this.fetchVideos();
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
            this._uploadFileAudios = initialMediaItem;
            this.fetchAudios();
            return Status.OK;
        } catch (error) {
            // TODO: add error handler
            return undefined;
        }
    });

    public saveInventoryDocuments = action(async (): Promise<Status | undefined> => {
        try {
            this._documents = [];
            await this.saveInventoryMedia(MediaType.mtDocument);
            this._uploadFileDocuments = initialMediaItem;
            this.fetchDocuments();
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

    public fetchDocuments = action(async () => {
        this._documents = [];
        this._inventoryDocumentsID = [];
        await this.fetchMedia(MediaType.mtDocument, this._documents, this._inventoryDocumentsID);
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

    public removeMedia = action(
        async (imageuid: string, cb: () => void): Promise<Status | undefined> => {
            try {
                this._isLoading = true;
                await deleteMediaImage(imageuid).then((response) => {
                    if (response?.status === Status.ERROR) {
                        const { error } = response as BaseResponseError;
                        this._formErrorMessage = error || "Failed to delete media";
                    }
                });
                await cb();

                return Status.OK;
            } catch (error) {
                return undefined;
            } finally {
                this._isLoading = false;
            }
        }
    );

    public set uploadFileImages(files: UploadMediaItem) {
        this._uploadFileImages = files;
    }

    public set uploadFileVideos(files: UploadMediaItem) {
        this._uploadFileVideos = files;
    }

    public set uploadFileAudios(files: UploadMediaItem) {
        this._uploadFileAudios = files;
    }

    public set uploadFileDocuments(files: UploadMediaItem) {
        this._uploadFileDocuments = files;
    }
    public set exportWebActive(state: boolean) {
        this._exportWebActive = state;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set formErrorIndex(state: number[]) {
        this._formErrorIndex = state;
    }

    public set formErrorMessage(state: string) {
        this._formErrorMessage = state;
    }

    public set currentLocation(state: string) {
        this._currentLocation = state;
    }

    public set deleteReason(state: string) {
        this._deleteReason = state;
    }

    public clearMedia = () => {
        this._inventoryImagesID = [];
        this._images = [];
        this._inventoryVideoID = [];
        this._videos = [];
        this._inventoryAudioID = [];
        this._audios = [];
        this._inventoryDocumentsID = [];
        this._documents = [];
    };

    public saveCachedInventory = () => {
        this._cachedInventory = {
            options_info: this._inventoryOptions,
            Audit: this._inventoryAudit,
            extdata: this._inventoryExtData,
            ...this._inventory,
        };
    };

    public clearCachedInventory = () => {
        this._cachedInventory = {} as Inventory;
    };

    public clearInventory = () => {
        this._inventory = {} as Inventory;
        this._inventoryAudit = initialAuditState as Audit;
        this._inventoryOptions = [];
        this._inventoryExtData = {} as InventoryExtData;
        this._exportWeb = {} as InventoryWebInfo;
        this._exportWebHistory = [] as InventoryExportWebHistory[];
        this._printList = [] as InventoryPrintForm[];
        this._formErrorMessage = "";
        this._deleteReason = "";
        this.clearMedia();
    };
}
