import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { setReportDocumentTemplate } from "http/services/reports.service";
import { ReportColumnSelect } from "./column-select";

export const ReportEditForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const store = useStore().reportStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { id } = useParams();
    const { report, reportName, reportColumns, getReport, changeReport } = store;
    const toast = useToast();

    useEffect(() => {
        id &&
            getReport(id).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response?.error || "Error while fetching report",
                        life: TOAST_LIFETIME,
                    });
                    navigate(`/dashboard/reports`);
                }
            });
        return () => {
            store.report = {};
        };
    }, [id]);

    const handleDownloadForm = async (download: boolean = false) => {
        const errorMessage = "Error while download report";
        if (id && authUser && authUser.useruid) {
            const response = await setReportDocumentTemplate(id, {
                itemUID: id,
                columns: reportColumns,
            }).then((response) => {
                if (response && response.status === Status.ERROR) {
                    const { error } = response;
                    return toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: error || errorMessage,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    return response;
                }
            });
            if (!response) {
                return;
            }
            const url = new Blob([response], { type: "application/pdf" });
            let link = document.createElement("a");
            link.href = window.URL.createObjectURL(url);
            if (download) {
                link.download = `report_form_${id}.pdf`;
                link.click();
            } else {
                window.open(
                    link.href,
                    "_blank",
                    "toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=100,width=1280,height=720"
                );
            }
        }
    };

    return (
        <div className='col-8 grid report-form'>
            <div className='report-form__header uppercase'>{id ? "Edit" : "New"} report</div>
            <div className='report-form__body grid'>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            value={report.name || reportName}
                            onChange={(e) => changeReport("name", e.target.value)}
                        />
                        <label className='float-label w-full'>Name</label>
                    </span>
                </div>
                {report && (
                    <>
                        <div className='col-3'>
                            <Button
                                className='uppercase w-full px-6 report__button'
                                outlined
                                onClick={() => handleDownloadForm()}
                            >
                                Preview
                            </Button>
                        </div>
                        <div className='col-3'>
                            <Button
                                className='uppercase w-full px-6 report__button'
                                outlined
                                onClick={() => handleDownloadForm(true)}
                            >
                                Download
                            </Button>
                        </div>
                    </>
                )}

                <ReportColumnSelect />

                <div className='splitter col-12'>
                    <h3 className='splitter__title m-0 pr-3'>Report options</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox
                            checked={!!report.ShowTotals}
                            onChange={() => {
                                changeReport("ShowTotals", !report.ShowTotals ? 1 : 0);
                            }}
                        />
                        Show Totals
                    </label>
                </div>
                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox
                            checked={!!report.ShowAverages}
                            onChange={() => {
                                changeReport("ShowAverages", !report.ShowAverages ? 1 : 0);
                            }}
                        />
                        Show Averages
                    </label>
                </div>
                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox
                            checked={!!report.ShowLineCount}
                            onChange={() => {
                                changeReport("ShowLineCount", !report.ShowLineCount ? 1 : 0);
                            }}
                        />
                        Show Line Count
                    </label>
                </div>

                <div className='splitter col-12'>
                    <h3 className='splitter__title m-0 pr-3'>Report parameters</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='col-4'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox
                            checked={!!report.AskForStartAndEndDates}
                            onChange={() => {
                                changeReport(
                                    "AskForStartAndEndDates",
                                    !report.AskForStartAndEndDates ? 1 : 0
                                );
                            }}
                        />
                        Ask for Start and End Dates
                    </label>
                </div>
            </div>
        </div>
    );
});
