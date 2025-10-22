import { AxiosError } from "axios";
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
    InventoryWebCheck,
    CreateMediaItemRecordResponse,
    InventorySetResponse,
    UploadMediaLink,
    UploadMediaItem,
    MediaItem,
} from "common/models/inventory";
import { UserGroup } from "common/models/user";
import { getAccountPayment } from "http/services/accounts.service";
import { getUserGroupList } from "http/services/auth-user.service";
import {
    getInventoryInfo,
    setInventory,
    getInventoryWebInfo,
    getInventoryWebInfoHistory,
    getInventoryPrintForms,
    setInventoryExportWeb,
    getInventoryWebCheck,
    setInventoryWebCheck,
} from "http/services/inventory-service";
import {
    getInventoryMediaItemList,
    createMediaItemRecord,
    uploadInventoryMedia,
    setMediaItemData,
    getInventoryMediaItem,
    deleteMediaImage,
} from "http/services/media.service";
import { updateWatermark } from "http/services/settings.service";
import { makeAutoObservable, action } from "mobx";
import { RootStore } from "store";

const initialMediaItem: UploadMediaItem = {
    file: [],
    data: {
        contenttype: MediaType.mtUnknown,
        notes: "",
    },
};

const initialMediaLink: UploadMediaLink = {
    contenttype: MediaType.mtUnknown,
    notes: "",
    mediaurl: "",
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
    private _inventoryGroupID: string = "";
    private _inventoryGroupClassList: UserGroup[] = [];

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

    private _inventoryLinksID: Partial<InventoryMediaItemID>[] = [];
    private _uploadFileLinks: UploadMediaLink = initialMediaLink;
    private _links: MediaItem[] = [];

    private _printList: InventoryPrintForm[] = [];
    private _formErrorIndex: number[] = [];
    private _currentLocation: string = "";
    private _deleteReason: string = "";
    private _memoRoute: string = "";
    private _activeTab: number | null = null;
    private _isErasingNeeded: boolean = true;
    private _inventoryLoaded: boolean = false;
    protected _tabLength: number = 0;

    protected _isLoading: boolean = false;
    protected _isFormChanged: boolean = false;
    protected _formErrorMessage: string = "";

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
    public get inventoryGroupID() {
        return this._inventoryGroupID;
    }
    public get inventoryGroupClassList() {
        return this._inventoryGroupClassList;
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

    public get links() {
        return this._links;
    }
    public get uploadFileLinks() {
        return this._uploadFileLinks;
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

    public get activeTab() {
        return this._activeTab;
    }

    public get tabLength() {
        return this._tabLength;
    }

    public get deleteReason() {
        return this._deleteReason;
    }

    public get memoRoute() {
        return this._memoRoute;
    }

    public get inventoryLoaded() {
        return this._inventoryLoaded;
    }

    public get isErasingNeeded() {
        return this._isErasingNeeded;
    }

    public getInventory = async () => {
        try {
            const response = (await getInventoryInfo(this._inventoryID)) as BaseResponseError;
            if (response?.status === Status.ERROR) {
                throw response.error;
            } else {
                const info = response as Inventory;
                const { extdata, options_info, Audit, ...inventory } = info;
                this._inventory = { ...inventory, Make: inventory.Make.toUpperCase() } as Inventory;

                const changedExtData = {
                    ...extdata,
                    fpReduxAmt: extdata?.fpReduxAmt && extdata.fpReduxAmt / 100,
                    fpRemainBal: extdata?.fpRemainBal && extdata?.fpRemainBal / 100,
                    csFee: extdata?.csFee && extdata?.csFee / 100,
                    csReserveAmt: extdata?.csReserveAmt && extdata?.csReserveAmt / 100,
                    csEarlyRemoval: extdata?.csEarlyRemoval && extdata?.csEarlyRemoval / 100,
                    csListingFee: extdata?.csListingFee && extdata?.csListingFee / 100,
                    csOwnerAskingPrice:
                        extdata?.csOwnerAskingPrice && extdata?.csOwnerAskingPrice / 100,
                    purPurchaseBuyerComm:
                        extdata?.purPurchaseBuyerComm && extdata?.purPurchaseBuyerComm / 100,
                    purPurchaseAmount:
                        extdata?.purPurchaseAmount && extdata?.purPurchaseAmount / 100,
                } as InventoryExtData;

                this._inventoryOptions = options_info || [];

                this._inventoryExtData = changedExtData || ({} as InventoryExtData);
                this._inventoryAudit = Audit || (initialAuditState as Audit);
                this._inventoryLoaded = true;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
            this._isFormChanged = false;
        }
    };

    public getInventoryGroupClassList = async (): Promise<BaseResponseError | undefined> => {
        if (this._inventoryGroupClassList.length > 0) {
            return;
        }

        try {
            const response = await getUserGroupList(this.rootStore.userStore.authUser!.useruid);
            if (response && Array.isArray(response)) {
                this._inventoryGroupClassList = response;
            }
        } catch (error) {
            return { status: Status.ERROR, error: error as string };
        }
    };

    private getInventoryMedia = async (): Promise<Status> => {
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
                                this._documents.push({
                                    src: "",
                                    itemuid,
                                    info,
                                });
                                break;
                            case MediaType.mtLink:
                                const linkExists = this._links.some(
                                    (link) => link.itemuid === itemuid
                                );
                                if (!linkExists) {
                                    this._links.push({
                                        src: "",
                                        itemuid,
                                        info,
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    }
                });
                const uniqueImages = new Set();
                this._images = this._images.filter((img) => {
                    if (!img.itemuid || uniqueImages.has(img.itemuid)) return false;
                    uniqueImages.add(img.itemuid);
                    return true;
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
        try {
            const response = await getInventoryWebInfo(id);
            if (response) {
                this._exportWeb = response;
            }
        } catch (error) {}
    };

    public getInventoryPayments = async (id = this._inventoryID): Promise<void> => {
        try {
            const response = await getAccountPayment(id);
            if (response) {
                this._inventoryPayments = response;
            }
        } catch (error) {}
    };

    public getInventoryExportWebHistory = async (id = this._inventoryID): Promise<void> => {
        try {
            const response = await getInventoryWebInfoHistory(id);
            if (response) {
                this._exportWebHistory = response;
            }
        } catch (error) {}
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

    public getWebCheckStatus = async (id = this._inventoryID) => {
        try {
            const response = await getInventoryWebCheck(id);
            if (response?.status === Status.OK) {
                const { enabled } = response as InventoryWebCheck;
                this._exportWebActive = !!enabled;
            } else {
                const { error } = response as BaseResponseError;
                throw new Error(error);
            }
        } catch (error) {
            if (error instanceof Error) {
                return {
                    status: Status.ERROR,
                    error: error.message,
                };
            }
            return undefined;
        }
    };

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
        async (inventoryuid: string = "0"): Promise<string | BaseResponseError> => {
            try {
                this._isLoading = true;

                const inventoryData: Inventory = {
                    ...this.inventory,
                    extdata: {
                        ...this.inventoryExtData,
                        fpReduxAmt: (this.inventoryExtData?.fpReduxAmt || 0) * 100,
                        fpRemainBal: (this.inventoryExtData?.fpRemainBal || 0) * 100,
                        csFee: (this.inventoryExtData?.csFee || 0) * 100,
                        csReserveAmt: (this.inventoryExtData?.csReserveAmt || 0) * 100,
                        csEarlyRemoval: (this.inventoryExtData?.csEarlyRemoval || 0) * 100,
                        csListingFee: (this.inventoryExtData?.csListingFee || 0) * 100,
                        csOwnerAskingPrice: (this.inventoryExtData?.csOwnerAskingPrice || 0) * 100,
                        purPurchaseBuyerComm:
                            (this.inventoryExtData?.purPurchaseBuyerComm || 0) * 100,
                        purPurchaseAmount: (this.inventoryExtData?.purPurchaseAmount || 0) * 100,
                    },
                    options_info: this.inventoryOptions,
                    Audit: this.inventoryAudit,
                };

                const generalSettingsStore = this.rootStore.generalSettingsStore;
                const watermarkPromise = generalSettingsStore.isSettingsChanged
                    ? (async () => {
                          const useruid = this.rootStore.userStore.authUser?.useruid;
                          if (useruid) {
                              const filteredSettings = Object.fromEntries(
                                  Object.entries(generalSettingsStore.settings).filter(
                                      ([key]) =>
                                          !["index", "created", "updated", "status"].includes(key)
                                  )
                              );

                              const response = await updateWatermark(
                                  this._inventory?.itemuid,
                                  filteredSettings
                              );
                              if (response?.status === Status.ERROR) {
                                  return response;
                              }
                          }
                          generalSettingsStore.isSettingsChanged = false;
                          return { status: Status.OK };
                      })()
                    : Promise.resolve({ status: Status.OK });

                const [inventoryResponse, webResponse, watermarkResponse] = await Promise.all([
                    setInventory(inventoryuid, inventoryData),
                    setInventoryExportWeb(inventoryuid, this._exportWeb),
                    watermarkPromise,
                ]);

                if (watermarkResponse?.status === Status.ERROR) {
                    return watermarkResponse;
                }

                if (inventoryResponse?.status === Status.OK && webResponse?.status === Status.OK) {
                    if (inventoryuid !== "0") {
                        await setInventoryWebCheck(inventoryuid, {
                            enabled: !!this._exportWebActive ? 1 : 0,
                        });
                    }
                    return Status.OK;
                }

                return {
                    status: Status.ERROR,
                    error: inventoryResponse?.error || webResponse?.error,
                };
            } catch (error) {
                return {
                    status: Status.ERROR,
                    error: error as string,
                };
            } finally {
                this._isLoading = false;
            }
        }
    );

    private saveInventoryMedia = action(
        async (mediaType: MediaType): Promise<{ status: Status; savedItems?: MediaItem[] }> => {
            try {
                this._isLoading = true;
                const currentMt = new Map([
                    [MediaType.mtPhoto, this._uploadFileImages],
                    [MediaType.mtVideo, this._uploadFileVideos],
                    [MediaType.mtAudio, this._uploadFileAudios],
                    [MediaType.mtDocument, this._uploadFileDocuments],
                ]);

                const savedItems: MediaItem[] = [];
                const uploadPromises = (currentMt.get(mediaType) || { file: [] }).file.map(
                    async (file) => {
                        const formData = new FormData();
                        formData.append("file", file);

                        try {
                            const createMediaResponse = (await createMediaItemRecord(
                                mediaType
                            )) as CreateMediaItemRecordResponse;
                            if (createMediaResponse?.status === Status.OK) {
                                const uploadMediaResponse = (await uploadInventoryMedia(
                                    createMediaResponse.itemUID,
                                    formData
                                )) as InventorySetResponse;
                                if (uploadMediaResponse?.status === Status.OK) {
                                    const mediaDataResponse = await setMediaItemData(
                                        this._inventoryID,
                                        {
                                            mediaitemuid: uploadMediaResponse.itemuid,
                                            contenttype: (
                                                currentMt.get(mediaType) as UploadMediaItem
                                            ).data.contenttype,
                                            notes: (currentMt.get(mediaType) as UploadMediaItem)
                                                .data.notes,
                                            type: mediaType,
                                        }
                                    );

                                    if (mediaDataResponse?.status === Status.ERROR) {
                                        const { error } = mediaDataResponse as BaseResponseError;
                                        this._formErrorMessage = error || "Failed to upload file";
                                    } else {
                                        const savedItem: MediaItem = {
                                            src: URL.createObjectURL(file),
                                            itemuid: uploadMediaResponse.itemuid,
                                            mediauid: uploadMediaResponse.itemuid,
                                            info: {
                                                contenttype: (
                                                    currentMt.get(mediaType) as UploadMediaItem
                                                ).data.contenttype,
                                                notes: (currentMt.get(mediaType) as UploadMediaItem)
                                                    .data.notes,
                                                created: new Date().toISOString(),
                                            },
                                        };
                                        savedItems.push(savedItem);
                                    }
                                }
                            }
                        } finally {
                            this._isLoading = false;
                            this._formErrorMessage = "";
                        }
                    }
                );

                await Promise.all(uploadPromises);

                return { status: Status.OK, savedItems };
            } catch (error) {
                return { status: Status.ERROR };
            } finally {
                this._isLoading = false;
            }
        }
    );

    private saveInventoryMediaLink = action(async (): Promise<Status | undefined> => {
        try {
            this._isLoading = true;
            const mediaType = MediaType.mtLink;

            const existingLink = this._links.find(
                (link) =>
                    link.info &&
                    (link.info as any).mediaurl === this._uploadFileLinks.mediaurl &&
                    (link.info as any).contenttype === this._uploadFileLinks.contenttype &&
                    (link.info as any).notes === this._uploadFileLinks.notes
            );

            if (existingLink) {
                this._formErrorMessage = "A link with this URL, category, and notes already exists";
                return Status.ERROR;
            }

            try {
                const createMediaResponse = (await createMediaItemRecord(
                    mediaType
                )) as CreateMediaItemRecordResponse;
                if (createMediaResponse?.status === Status.OK) {
                    await setMediaItemData(this._inventoryID, {
                        contenttype: this._uploadFileLinks.contenttype,
                        mediaitemuid: createMediaResponse.itemUID,
                        notes: this._uploadFileLinks.notes,
                        mediaurl: this._uploadFileLinks.mediaurl,
                        type: mediaType,
                    }).then((response) => {
                        if (response?.status === Status.ERROR) {
                            const { error } = response as BaseResponseError;
                            this._formErrorMessage = error || "Failed to save link";
                        }
                    });
                }
            } finally {
                this._isLoading = false;
                this._formErrorMessage = "";
            }

            return Status.OK;
        } catch (error) {
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public saveInventoryImages = action(async (): Promise<Status | undefined> => {
        try {
            const { status } = await this.saveInventoryMedia(MediaType.mtPhoto);
            if (status === Status.OK) {
                this._uploadFileImages = initialMediaItem;
            }
            return status;
        } catch (error) {
            return undefined;
        }
    });
    public saveInventoryVideos = action(async (): Promise<Status | undefined> => {
        try {
            const { status, savedItems } = await this.saveInventoryMedia(MediaType.mtVideo);
            if (status === Status.OK) {
                this._uploadFileVideos = initialMediaItem;
                if (savedItems) {
                    this._videos = [...this._videos, ...savedItems];
                }
            }
            return status;
        } catch (error) {
            return undefined;
        }
    });
    public saveInventoryAudios = action(async (): Promise<Status | undefined> => {
        try {
            const { status, savedItems } = await this.saveInventoryMedia(MediaType.mtAudio);
            if (status === Status.OK) {
                this._uploadFileAudios = initialMediaItem;
                if (savedItems) {
                    this._audios = [...this._audios, ...savedItems];
                }
            }
            return status;
        } catch (error) {
            return undefined;
        }
    });

    public saveInventoryDocuments = action(async (): Promise<Status | undefined> => {
        try {
            const { status, savedItems } = await this.saveInventoryMedia(MediaType.mtDocument);
            if (status === Status.OK) {
                this._uploadFileDocuments = initialMediaItem;
                if (savedItems) {
                    this._documents = [...this._documents, ...savedItems];
                }
            }
            return status;
        } catch (error) {
            return undefined;
        }
    });

    public saveInventoryLinks = action(async (): Promise<BaseResponseError | undefined> => {
        try {
            const result = await this.saveInventoryMediaLink();
            if (result === Status.OK) {
                this._uploadFileLinks = initialMediaLink;
                await this.fetchLinks();
            }
            return undefined;
        } catch (error) {
            const err = error as AxiosError;
            return {
                status: Status.ERROR,
                error: err?.message,
            };
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

    public changeInventoryLinksOrder = action(
        async (
            linkItem: Pick<InventoryMediaPostData, "itemuid" | "order">
        ): Promise<BaseResponseError | undefined> => {
            try {
                const currentLink = this._links.find((link) => link.itemuid === linkItem.itemuid);
                if (currentLink?.info) {
                    const response = await setMediaItemData(this._inventoryID, {
                        mediaitemuid: currentLink.info.mediauid,
                        ...currentLink.info,
                        itemuid: linkItem.itemuid,
                        order: linkItem.order,
                    });
                    return {
                        status: response?.status ?? Status.ERROR,
                        error: response?.error,
                    };
                }
                return {
                    status: Status.ERROR,
                    error: "Link not found",
                };
            } catch (error) {
                const err = error as AxiosError;
                return {
                    status: Status.ERROR,
                    error: err?.message,
                };
            }
        }
    );

    private async fetchMedia(
        mediaType: MediaType,
        mediaArray: MediaItem[],
        inventoryMediaID: Partial<InventoryMediaItemID>[]
    ) {
        try {
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
            } else if (mediaType === MediaType.mtLink) {
                this._links = [];

                const uniqueLinks: MediaItem[] = [];
                result.forEach((link) => {
                    const linkExists = uniqueLinks.some(
                        (existingLink) => existingLink.itemuid === link.itemuid
                    );
                    if (!linkExists) {
                        uniqueLinks.push(link);
                    }
                });

                this._links = uniqueLinks;
            }
        } catch (error) {
        } finally {
            this._isLoading = false;
        }
    }

    public fetchImages = action(async () => {
        this._images = [];
        this._inventoryImagesID = [];
        await this.getInventoryMedia();
        await this.fetchMedia(MediaType.mtPhoto, this._images, this._inventoryImagesID);
    });

    public fetchVideos = action(async () => {
        this._videos = [];
        this._inventoryVideoID = [];
        await this.getInventoryMedia();
        await this.fetchMedia(MediaType.mtVideo, this._videos, this._inventoryVideoID);
    });

    public fetchAudios = action(async () => {
        this._audios = [];
        this._inventoryAudioID = [];
        await this.getInventoryMedia();
        await this.fetchMedia(MediaType.mtAudio, this._audios, this._inventoryAudioID);
    });

    public fetchDocuments = action(async () => {
        this._documents = [];
        this._inventoryDocumentsID = [];
        await this.getInventoryMedia();
        await this.fetchMedia(MediaType.mtDocument, this._documents, this._inventoryDocumentsID);
    });

    public fetchLinks = action(async () => {
        this._links = [];
        this._inventoryLinksID = [];
        await this.getInventoryMedia();
        await this.fetchMedia(MediaType.mtLink, this._links, this._inventoryLinksID);
    });

    public getPrintList = action(async (inventoryuid = this._inventoryID) => {
        try {
            const response = await getInventoryPrintForms(inventoryuid);
            if (response) {
                this._printList = response;
            }
        } catch (error) {
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

    public resetUploadState = () => {
        this._uploadFileImages = initialMediaItem;
        this._formErrorMessage = "";
    };

    public set inventoryID(id: string) {
        this._inventoryID = id;
    }

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

    public set uploadFileLinks(data: UploadMediaLink) {
        this._uploadFileLinks = data;
    }

    public set exportWebActive(state: boolean) {
        this._exportWebActive = state;
    }

    public set inventoryGroupID(state: string) {
        this._inventoryGroupID = state;
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

    public set isFormChanged(state: boolean) {
        this._isFormChanged = state;
    }

    public set activeTab(state: number | null) {
        this._activeTab = state;
    }

    public set tabLength(state: number) {
        this._tabLength = state;
    }

    public set memoRoute(state: string) {
        this._memoRoute = state;
    }

    public set isErasingNeeded(state: boolean) {
        this._isErasingNeeded = state;
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
        this._inventoryLinksID = [];
        this._links = [];
    };

    public clearInventory = () => {
        if (this._isErasingNeeded) {
            this._isErasingNeeded = true;
            this._inventory = {} as Inventory;
            this._inventoryAudit = initialAuditState as Audit;
            this._inventoryGroupID = "";
            this._inventoryOptions = [];
            this._inventoryExtData = {} as InventoryExtData;
            this._exportWeb = {} as InventoryWebInfo;
            this._exportWebHistory = [] as InventoryExportWebHistory[];
            this._printList = [] as InventoryPrintForm[];
            this._isFormChanged = false;
            this._formErrorMessage = "";
            this._deleteReason = "";
            this.clearMedia();
        }
    };
}
