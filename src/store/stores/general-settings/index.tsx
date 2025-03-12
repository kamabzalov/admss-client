import { BaseResponseError, Status } from "common/models/base-response";
import { MediaType } from "common/models/enums";
import { GeneralSettings, WatermarkPostProcessing } from "common/models/general-settings";
import { CreateMediaItemRecordResponse } from "common/models/inventory";
import { createMediaItemRecord, uploadInventoryMedia } from "http/services/media.service";
import {
    getPostProcessing,
    getUserGeneralSettings,
    updatePostProcessing,
    updateUserGeneralSettings,
} from "http/services/settings.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

type TextBlock = Partial<WatermarkPostProcessing>;

const initialPostProcessing: TextBlock[] = [
    {
        id: 0,
        ppPattern: "",
        fontColor: 0,
        bkColor: 0,
        fontSize: 0,
        posX: 0,
        posY: 0,
        ppText: "",
        fontName: "",
        useruid: "",
    },
];

export class GeneralSettingsStore {
    public rootStore: RootStore;
    private _settings: GeneralSettings = {} as GeneralSettings;
    private _settingsID: string = "";
    private _watermarkImage: File | null = null;
    private _postProcessing: WatermarkPostProcessing[] =
        initialPostProcessing as WatermarkPostProcessing[];
    protected _isLoading = false;
    private _isSettingsChanged: boolean = false;
    private _isPostProcessingChanged: boolean = false;
    private _memoRoute: string = "";
    private _activeTab: number | null = null;
    private _tabLength: number = 0;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get settings() {
        return this._settings;
    }

    public get isSettingsChanged() {
        return this._isSettingsChanged;
    }

    public get watermarkImage() {
        return this._watermarkImage;
    }

    public get postProcessing() {
        return this._postProcessing;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public get memoRoute() {
        return this._memoRoute;
    }

    public get tabLength() {
        return this._tabLength;
    }

    public get activeTab() {
        return this._activeTab;
    }

    public getSettings = async () => {
        this._isLoading = true;
        try {
            const userSettings = await getUserGeneralSettings();
            if (userSettings && !userSettings.error) {
                const { settings } = userSettings as unknown as { settings: GeneralSettings };
                this._settings = settings as GeneralSettings;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
        }
    };

    public getPostProcessing = async () => {
        this._isLoading = true;
        try {
            const useruid = this.rootStore.userStore.authUser?.useruid;
            if (!useruid) return { status: Status.ERROR, error: "User UID is not available" };
            const postProcessing = await getPostProcessing(useruid);
            if (postProcessing && postProcessing.error) {
                return {
                    status: Status.ERROR,
                    error: postProcessing.error,
                };
            } else {
                if (!postProcessing && Array.isArray(postProcessing)) return;
                const response = postProcessing as unknown as WatermarkPostProcessing[];
                this._postProcessing = response;
                this._isPostProcessingChanged = false;
            }
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
        }
    };

    public savePostProcessing = async () => {
        try {
            const useruid = this.rootStore.userStore.authUser?.useruid;
            if (!useruid) return { status: Status.ERROR, error: "User UID is not available" };
            await updatePostProcessing(useruid, this._postProcessing as any);
            this._isPostProcessingChanged = false;
        } catch (error) {
            return {
                status: Status.ERROR,
                error,
            };
        } finally {
            this._isLoading = false;
        }
    };

    public changeSettings = action(
        (
            key: keyof GeneralSettings,
            value: string | number | string[],
            isSettingsChanged: boolean = true
        ) => {
            if (isSettingsChanged) {
                this._isSettingsChanged = true;
            }
            this._settings[key] = value as never;
        }
    );

    public changePostProcessing = action((state: Partial<WatermarkPostProcessing>[]) => {
        this._isSettingsChanged = true;
        this._isPostProcessingChanged = true;
        this._postProcessing = state as WatermarkPostProcessing[];
    });

    private setWatermarkImage = async (): Promise<any> => {
        if (!this._watermarkImage) {
            return { status: Status.OK };
        }
        this._isLoading = true;
        try {
            if (this._watermarkImage && this._watermarkImage.size) {
                const formData = new FormData();
                formData.append("file", this._watermarkImage);

                const createMediaResponse = await createMediaItemRecord(MediaType.mtPhoto);
                const { itemUID } = createMediaResponse as CreateMediaItemRecordResponse;
                if (createMediaResponse?.status === Status.OK) {
                    const uploadMediaResponse = await uploadInventoryMedia(itemUID, formData);
                    const { itemuid } = uploadMediaResponse as any;
                    if (uploadMediaResponse?.status === Status.OK) {
                        await this.changeSettings("logomediauid", itemuid, true);
                    }
                }
            }
        } catch (error) {
            return { status: Status.ERROR, error };
        } finally {
            this._isLoading = false;
        }
    };

    public saveSettings = action(async (): Promise<BaseResponseError> => {
        try {
            this._isLoading = true;
            if (this._isPostProcessingChanged) {
                await this.savePostProcessing();
            }
            if (this._watermarkImage !== null) {
                await this.setWatermarkImage();
            }
            updateUserGeneralSettings({
                ...this._settings,
            });
            return { status: Status.OK };
        } catch (error) {
            return error as BaseResponseError;
        } finally {
            this._isLoading = false;
        }
    });

    public set watermarkImage(state: File | null) {
        this._isSettingsChanged = true;
        this._watermarkImage = state;
    }

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set memoRoute(state: string) {
        this._memoRoute = state;
    }

    public set tabLength(state: number) {
        this._tabLength = state;
    }

    public set activeTab(state: number | null) {
        this._activeTab = state;
    }

    public set isSettingsChanged(state: boolean) {
        this._isSettingsChanged = state;
    }

    public clearSettings = () => {
        this._settings = {} as GeneralSettings;
        this._isSettingsChanged = false;
        this._isPostProcessingChanged = false;
        this._settingsID = "";
    };
}
