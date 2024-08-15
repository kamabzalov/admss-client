/* eslint-disable no-unused-vars */

import { Status } from "common/models/base-response";
import { ReportDocument } from "common/models/reports";
import { action, makeAutoObservable } from "mobx";
import { RootStore } from "store";

export class ReportStore {
    public rootStore: RootStore;
    private _report: Partial<ReportDocument> = {} as ReportDocument;
    protected _isLoading = false;

    public constructor(rootStore: RootStore) {
        makeAutoObservable(this, { rootStore: false });
        this.rootStore = rootStore;
    }

    public get report() {
        return this._report;
    }

    public get isLoading() {
        return this._isLoading;
    }

    public changeReport = action((key: keyof ReportDocument, value: string | number | string[]) => {
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

    public setReport = action((report: ReportDocument) => {
        this._report = report;
    });

    public set isLoading(state: boolean) {
        this._isLoading = state;
    }

    public clearReport = () => {
        this._report = {} as ReportDocument;
    };
}
