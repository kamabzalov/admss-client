import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { setReportDocumentTemplate } from "http/services/reports.service";
import { ReportColumnSelect } from "./column-select";
import { MultiSelect } from "primereact/multiselect";
import { ReportCollection } from "common/models/reports";
import { selectedItemTemplate } from "dashboard/reports/common/panel-content";

export const ReportEditForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const store = useStore().reportStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { id } = useParams();
    const { report, reportName, reportColumns, customCollections, getReport, changeReport } = store;
    const [selectedCollection, setSelectedCollection] = useState<ReportCollection | null>(null);
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
            store.reportName = "";
            store.report = {};
        };
    }, [id]);

    const handleDownloadForm = async (download: boolean = false) => {
        const errorMessage = "Error while download report";
        if (authUser && authUser.useruid) {
            const response = await setReportDocumentTemplate(id || "0", {
                itemUID: id || "0",
                timestamp: Date.now(),
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
                link.download = `report_form_${id || reportName}.pdf`;
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

    const getAllCollections = () => {
        const allCollections: Partial<ReportCollection>[] = [];
        customCollections.forEach((collection) => {
            allCollections.push(collection);

            if (collection.collections) {
                collection.collections.forEach((subCollection) => {
                    allCollections.push(subCollection);
                });
            }
        });
        return allCollections;
    };

    return (
        <div className='col-8 report-form'>
            <div className='report-form__header uppercase'>
                {report.isdefault ? "View" : id ? "Edit" : "New"} report
            </div>
            <div className='report-form__control grid'>
                <div className={report && id ? "report-form__input" : "col-6"}>
                    <span className='p-float-label'>
                        <InputText
                            className='w-full'
                            disabled={!!report.isdefault}
                            value={report?.name || reportName}
                            onChange={(e) => changeReport("name", e.target.value)}
                        />
                        <label className='float-label w-full'>Name</label>
                    </span>
                </div>
                <div className={report && id ? "report-form__input" : "col-6"}>
                    <span className='p-float-label'>
                        <MultiSelect
                            dataKey='itemUID'
                            filter
                            optionLabel='name'
                            options={getAllCollections()}
                            className='w-full edit-collection__multiselect'
                            selectedItemTemplate={selectedItemTemplate}
                            maxSelectedLabels={4}
                            placeholder='Collection'
                            showSelectAll={false}
                            value={selectedCollection}
                            onChange={(e) => {
                                e.stopPropagation();
                                setSelectedCollection(e.value as ReportCollection);
                            }}
                            pt={{
                                wrapper: {
                                    className: "edit-collection__multiselect-wrapper",
                                    style: {
                                        maxHeight: "550px",
                                    },
                                },
                            }}
                        />
                        <label className='float-label'>Select reports</label>
                    </span>
                </div>
                {report && id && (
                    <div className='col-2 report-form__buttons'>
                        <Button
                            className='report__button'
                            onClick={() => handleDownloadForm()}
                            icon='icon adms-preview'
                            disabled={!report.name}
                            severity={!report.name ? "secondary" : "success"}
                        />
                        <Button
                            className='report__button'
                            icon='icon adms-download'
                            onClick={() => handleDownloadForm(true)}
                            disabled={!report.name}
                            severity={!report.name ? "secondary" : "success"}
                        />
                    </div>
                )}
            </div>

            <div className='report-form__body grid'>
                <ReportColumnSelect />

                <div className='splitter col-12'>
                    <h3 className='splitter__title m-0 pr-3'>Report options</h3>
                    <hr className='splitter__line flex-1' />
                </div>

                <div className='col-3'>
                    <label className='cursor-pointer report-control__checkbox'>
                        <Checkbox
                            checked={!!report.ShowTotals}
                            disabled={!!report.isdefault}
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
                            disabled={!!report.isdefault}
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
                            disabled={!!report.isdefault}
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
                            disabled={!!report.isdefault}
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
