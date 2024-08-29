import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import { ReportSelect } from "../common";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { useToast } from "dashboard/common/toast";
import { Status } from "common/models/base-response";
import { TOAST_LIFETIME } from "common/settings";
import { getReportColumns, setReportDocumentTemplate } from "http/services/reports.service";
import { ReportServiceColumns, ReportServices } from "common/models/reports";

const dataSetValues: ReportServices[] = [
    ReportServices.INVENTORY,
    ReportServices.CONTACTS,
    ReportServices.DEALS,
    ReportServices.ACCOUNTS,
];

export const ReportEditForm = observer((): ReactElement => {
    const store = useStore().reportStore;
    const userStore = useStore().userStore;
    const { authUser } = userStore;
    const { id } = useParams();
    const { report, reportName, getReport, changeReport } = store;
    const toast = useToast();
    const [availableValues, setAvailableValues] = useState<ReportServiceColumns[]>([]);
    const [selectedValues, setSelectedValues] = useState<ReportServiceColumns[]>([]);
    const [currentItem, setCurrentItem] = useState<ReportServiceColumns | null>(null);
    const [dataSet, setDataSet] = useState<ReportServices | null>(null);

    useEffect(() => {
        const useruid = authUser?.useruid;
        if (dataSet && useruid)
            getReportColumns({ service: dataSet, useruid }).then((response) => {
                if (response?.status === Status.ERROR) {
                    toast.current?.show({
                        severity: "error",
                        summary: Status.ERROR,
                        detail: response?.error,
                        life: TOAST_LIFETIME,
                    });
                } else {
                    setAvailableValues(response);
                }
            });
    }, [dataSet, authUser?.useruid]);

    useEffect(() => {
        store.reportColumns = selectedValues;
    }, [selectedValues]);

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
                }
            });
    }, [id]);

    const moveItem = (
        item: ReportServiceColumns,
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setFrom(from.filter((i) => i !== item));
        setTo([...to, item]);
        setCurrentItem(null);
    };

    const moveAllItems = (
        from: ReportServiceColumns[],
        to: ReportServiceColumns[],
        setFrom: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>,
        setTo: React.Dispatch<React.SetStateAction<ReportServiceColumns[]>>
    ) => {
        setTo([...to, ...from]);
        setFrom([]);
    };

    const changeAvailableOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "down") {
            const index = availableValues.indexOf(item);
            const newItems = [...availableValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setAvailableValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = availableValues.filter((i) => i !== item);
            setAvailableValues([...valuesWithoutItem, item]);
        }
    };

    const changeSelectedOrder = (
        item: ReportServiceColumns,
        direction: "up" | "down" | "top" | "bottom"
    ) => {
        if (direction === "up") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index - 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "down") {
            const index = selectedValues.indexOf(item);
            const newItems = [...selectedValues];
            newItems.splice(index + 1, 0, newItems.splice(index, 1)[0]);
            setSelectedValues(newItems);
        } else if (direction === "top") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([item, ...valuesWithoutItem]);
        } else if (direction === "bottom") {
            const valuesWithoutItem = selectedValues.filter((i) => i !== item);
            setSelectedValues([...valuesWithoutItem, item]);
        }
    };

    const handleDownloadForm = async (download: boolean = false) => {
        const errorMessage = "Error while download report";
        if (id && authUser && authUser.useruid) {
            const response = await setReportDocumentTemplate(id, {
                itemUID: id,
                columns: selectedValues,
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
                            value={reportName}
                            onChange={(e) => (store.reportName = e.target.value)}
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
                <div className='col-12 report-controls'>
                    <div className='report-controls__top'>
                        <span className='p-float-label'>
                            <Dropdown
                                className='report-controls__dropdown'
                                options={dataSetValues}
                                value={dataSet}
                                onChange={(e) => setDataSet(e.value)}
                                pt={{
                                    wrapper: {
                                        className: "capitalize",
                                    },
                                }}
                            />
                            <label className='float-label'>Data Set</label>
                        </span>
                    </div>
                    <div className='report-control'>
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-up'
                            outlined
                            onClick={() => currentItem && changeAvailableOrder(currentItem, "up")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-up'
                            outlined
                            onClick={() => currentItem && changeAvailableOrder(currentItem, "top")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-down'
                            outlined
                            onClick={() => currentItem && changeAvailableOrder(currentItem, "down")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-down'
                            outlined
                            onClick={() =>
                                currentItem && changeAvailableOrder(currentItem, "bottom")
                            }
                        />
                    </div>
                    <ReportSelect
                        header='Available'
                        values={availableValues}
                        currentItem={currentItem}
                        onItemClick={(item) => setCurrentItem(item)}
                    />
                    <div className='report-control'>
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-right'
                            outlined
                            onClick={() =>
                                currentItem &&
                                moveItem(
                                    currentItem,
                                    availableValues,
                                    selectedValues,
                                    setAvailableValues,
                                    setSelectedValues
                                )
                            }
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-right'
                            outlined
                            onClick={() =>
                                moveAllItems(
                                    availableValues,
                                    selectedValues,
                                    setAvailableValues,
                                    setSelectedValues
                                )
                            }
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-left'
                            outlined
                            onClick={() =>
                                currentItem &&
                                moveItem(
                                    currentItem,
                                    selectedValues,
                                    availableValues,
                                    setSelectedValues,
                                    setAvailableValues
                                )
                            }
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-left'
                            outlined
                            onClick={() =>
                                moveAllItems(
                                    selectedValues,
                                    availableValues,
                                    setSelectedValues,
                                    setAvailableValues
                                )
                            }
                        />
                    </div>
                    <ReportSelect
                        header='Selected'
                        values={selectedValues}
                        currentItem={currentItem}
                        onItemClick={(item) => setCurrentItem(item)}
                    />
                    <div className='report-control'>
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-up'
                            outlined
                            onClick={() => currentItem && changeSelectedOrder(currentItem, "up")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-up'
                            outlined
                            onClick={() => currentItem && changeSelectedOrder(currentItem, "top")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-down'
                            outlined
                            onClick={() => currentItem && changeSelectedOrder(currentItem, "down")}
                        />
                        <Button
                            className='report-control__button'
                            icon='pi pi-angle-double-down'
                            outlined
                            onClick={() =>
                                currentItem && changeSelectedOrder(currentItem, "bottom")
                            }
                        />
                    </div>
                </div>

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
