import { BaseResponseError, Status } from "common/models/base-response";
import { ReportCreate, ReportInfo, ReportServiceColumns } from "common/models/reports";
import { createCustomReport, getReportInfo, updateReportInfo } from "http/services/reports.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class ReportStore {
    public rootStore: RootStore;
    private _report: Partial<ReportInfo> = {} as ReportInfo;
    private _reportName: string = "";
    private _reportColumns: ReportServiceColumns[] = [];
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get report() {
        return this._report;
    }

    public get reportName() {
        return this._reportName;
    }

    public get reportColumns() {
        return this._reportColumns;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public getReport = action(async (uid: string) => {
        this._isLoading = true;
        try {
            const response = await getReportInfo(uid);
            if (response?.status === Status.OK) {
                this._report = response as ReportInfo;
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

    public changeReport = action((key: keyof ReportInfo, value: string | number) => {
        this._report[key] = value as never;
    });

    public saveReport = action(
        async (uid: string | undefined): Promise<BaseResponseError | undefined> => {
            this._isLoading = true;
            try {
                if (!uid) {
                    const reportData: Partial<ReportCreate> & { columns?: ReportServiceColumns[] } =
                        {
                            name: this._report.name,
                        };

                    if (this._reportColumns && this._reportColumns.length) {
                        reportData.columns = this._reportColumns;
                    }

                    await createCustomReport(
                        reportData as Partial<ReportCreate> & { columns: ReportServiceColumns[] }
                    ).then((response) => {
                        if (response?.status === Status.OK) {
                            uid = (response as ReportInfo).itemuid;
                        } else {
                            const { error } = response as BaseResponseError;
                            throw new Error(error);
                        }
                    });
                }

                if (uid) {
                    const response = await updateReportInfo(uid, {
                        name: this._report.name,
                        ShowTotals: this._report.ShowTotals,
                        ShowAverages: this._report.ShowAverages,
                        ShowLineCount: this._report.ShowLineCount,
                        AskForStartAndEndDates: this._report.AskForStartAndEndDates,
                    });

                    if (response?.status === Status.OK) {
                        return response as ReportInfo;
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

    public set reportName(state: string) {
        this._reportName = state;
    }

    public set reportColumns(state: ReportServiceColumns[]) {
        this._reportColumns = state;
    }

    public clearReport = () => {
        this._report = {} as ReportInfo;
    };
}
