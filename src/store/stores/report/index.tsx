/* eslint-disable no-unused-vars */

import { BaseResponseError, Status } from "common/models/base-response";
import { ReportInfo } from "common/models/reports";
import { getReportInfo } from "http/services/reports.service";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class ReportStore {
    public rootStore: RootStore;
    private _report: Partial<ReportInfo> = {} as ReportInfo;
    private _reportName: string = "";
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
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public changeReport = action((key: keyof ReportInfo, value: string | number) => {
        this._report[key] = value as never;
    });

    public saveReport = action(async (): Promise<string | undefined> => {
        try {
            this._isLoading = true;

            return Status.ERROR;
        } catch (error) {
            return undefined;
        } finally {
            this._isLoading = false;
        }
    });

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public set reportName(state: string) {
        this._reportName = state;
    }

    public clearReport = () => {
        this._report = {} as ReportInfo;
    };
}
