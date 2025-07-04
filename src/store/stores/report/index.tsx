import { BaseResponseError, Status } from "common/models/base-response";
import {
    REPORT_TYPES,
    ReportCollection,
    ReportCollections,
    ReportCreate,
    ReportInfo,
    ReportServiceColumns,
} from "common/models/reports";
import {
    createCustomReport,
    getReportInfo,
    getUserReportCollectionsContent,
    updateReportInfo,
    updateCollection,
} from "http/services/reports.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class ReportStore {
    public rootStore: RootStore;
    private _report: Partial<ReportInfo> = {} as ReportInfo;
    private _allCollections: ReportCollection[] = [];
    private _customCollections: ReportCollection[] = [];
    private _currentID: string = "";
    private _initialReport: Partial<ReportInfo> = {} as ReportInfo;
    private _reportName: string = "";
    private _reportColumns: ReportServiceColumns[] = [];
    private _reportCollections: ReportCollections[] = [];
    private _isReportChanged: boolean = false;
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get report() {
        return this._report;
    }

    public get allCollections() {
        return this._allCollections;
    }

    public get customCollections() {
        return this._customCollections;
    }

    public get currentID() {
        return this._currentID;
    }

    public get reportName() {
        return this._reportName;
    }

    public get reportColumns() {
        return this._reportColumns;
    }

    public get reportCollections() {
        return this._reportCollections;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public get isReportChanged(): boolean {
        return this._isReportChanged;
    }

    private checkIsReportChanged() {
        const isSameReport = JSON.stringify(this._report) === JSON.stringify(this._initialReport);
        const isSameColumns =
            JSON.stringify(this._reportColumns) ===
            JSON.stringify(this._initialReport.columns || []);
        this._isReportChanged = !(isSameReport && isSameColumns);
    }

    public getReport = action(async (uid: string) => {
        this._isLoading = true;
        try {
            const response = await getReportInfo(uid);
            if (response?.status === Status.OK) {
                const report = response as ReportInfo;
                this._report = report;

                await this.getUserReportCollections(false);

                const allCollections = [
                    ...this._customCollections.flatMap((c) => [c, ...(c.collections || [])]),
                ];

                this._reportCollections = (report.collections || []).map((collection) => {
                    const foundCollection = allCollections.find(
                        (col) => col.itemUID === collection.collectionuid
                    );

                    return {
                        collectionuid: foundCollection?.itemUID || "",
                        name: foundCollection?.name || "",
                    };
                });

                this._initialReport = JSON.parse(JSON.stringify(response));
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
        } finally {
            this._isLoading = false;
        }
    });

    getUserReportCollections = action(async (force: boolean = false) => {
        if (this._allCollections.length > 0 && !force) {
            return;
        }

        const useruid = this.rootStore.userStore.authUser?.useruid!;
        const response = await getUserReportCollectionsContent(useruid);
        if (Array.isArray(response)) {
            const collectionsWithoutFavorite = response.filter(
                (collection: ReportCollection) => collection.description !== REPORT_TYPES.FAVORITES
            );
            const customReportsCollection = collectionsWithoutFavorite.find(
                (collection: ReportCollection) => collection.name === REPORT_TYPES.CUSTOM
            );
            if (customReportsCollection) {
                this._customCollections = [customReportsCollection];
                this._allCollections = [
                    customReportsCollection,
                    ...collectionsWithoutFavorite.filter(
                        (collection) => collection.name !== REPORT_TYPES.CUSTOM
                    ),
                ];
            } else {
                this._allCollections = collectionsWithoutFavorite;
            }
        } else {
            this._allCollections = [];
        }
    });

    public changeReport = action((key: keyof ReportInfo, value: string | number) => {
        this._report[key] = value as never;
        this.checkIsReportChanged();
    });

    public saveReport = action(
        async (uid: string | undefined): Promise<BaseResponseError | undefined> => {
            this._isLoading = true;
            try {
                const collections: ReportCollections[] = this._reportCollections.map(
                    ({ collectionuid, name }) => {
                        return {
                            collectionuid,
                            name,
                        };
                    }
                );
                if (!uid) {
                    const reportData: Partial<ReportCreate> & {
                        columns?: ReportServiceColumns[];
                    } & { collections: ReportCollections[] } = {
                        name: this._report.name,
                        collections,
                    };

                    if (this._reportColumns && this._reportColumns.length) {
                        reportData.columns = this._reportColumns;
                    }

                    const response = await createCustomReport(
                        reportData as Partial<ReportCreate> & { columns: ReportServiceColumns[] }
                    );

                    if (response?.status === Status.OK) {
                        uid = (response as ReportInfo).itemuid;
                        this._currentID = uid;
                        this._initialReport = JSON.parse(JSON.stringify(this._report));
                        return { ...response, itemuid: uid } as ReportInfo;
                    } else {
                        const { error } = response as BaseResponseError;
                        throw new Error(error);
                    }
                }

                if (uid) {
                    const response = await updateReportInfo(uid, {
                        name: this._report.name,
                        ShowTotals: this._report.ShowTotals,
                        ShowAverages: this._report.ShowAverages,
                        ShowLineCount: this._report.ShowLineCount,
                        AskForStartAndEndDates: this._report.AskForStartAndEndDates,
                        columns: this._reportColumns,
                        itemuid: this._report.itemuid,
                    });

                    if (response?.status === Status.OK) {
                        const initialCollections = this._initialReport.collections || [];
                        const collectionsChanged =
                            collections.length !== initialCollections.length ||
                            collections.some(
                                (col, index) =>
                                    col.collectionuid !== initialCollections[index]?.collectionuid
                            );

                        if (collectionsChanged) {
                            for (const { collectionuid, name } of collections) {
                                const collectionResponse = await updateCollection(
                                    this.rootStore.userStore.authUser?.useruid!,
                                    {
                                        itemuid: collectionuid,
                                        name,
                                        documents: [
                                            {
                                                documentUID: uid,
                                                collections,
                                            },
                                        ],
                                    }
                                );

                                if (collectionResponse?.status === Status.ERROR) {
                                    return {
                                        status: Status.ERROR,
                                        error:
                                            collectionResponse.error ||
                                            "Error while updating collection",
                                    };
                                }
                            }
                        }

                        this._initialReport = JSON.parse(JSON.stringify(this._report));
                        return { ...response, itemuid: uid } as ReportInfo;
                    } else {
                        const { error } = response as BaseResponseError;
                        throw new Error(error);
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    return {
                        status: Status.ERROR,
                        error: error.message,
                    };
                }
                return undefined;
            } finally {
                this._isLoading = false;
            }
        }
    );

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set report(state: Partial<ReportInfo>) {
        this._report = state;
    }

    public set customCollections(state: ReportCollection[]) {
        this._customCollections = state;
    }

    public set reportName(state: string) {
        this._reportName = state;
    }

    public set reportColumns(state: ReportServiceColumns[]) {
        this._reportColumns = state;
    }

    public set reportCollections(state: ReportCollections[]) {
        this._reportCollections = state;
    }

    public set isReportChanged(state: boolean) {
        this._isReportChanged = state;
    }

    public clearReport = () => {
        this._report = {} as ReportInfo;
        this._currentID = "";
        this._initialReport = {} as ReportInfo;
        this._isReportChanged = false;
        this._initialReport = {} as ReportInfo;
    };
}
