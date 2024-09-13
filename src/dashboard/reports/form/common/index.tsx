import { BaseResponseError, Status } from "common/models/base-response";
import { ReportServiceColumns } from "common/models/reports";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { EditAccessDialog } from "dashboard/reports/common";
import { copyReportDocument, deleteReportDocument } from "http/services/reports.service";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "store/hooks";

interface ReportSelectProps {
    header: string;
    values: ReportServiceColumns[];
    currentItem: ReportServiceColumns | null;
    onItemClick: (item: ReportServiceColumns) => void;
}

export const ReportSelect = ({
    header,
    values,
    currentItem,
    onItemClick,
}: ReportSelectProps): ReactElement => {
    return (
        <div className='report-select'>
            <span className='report-select__header'>{header}</span>
            <ul className='report-select__list'>
                {values.map((value) => (
                    <li
                        className={`report-select__item ${currentItem === value ? "selected" : ""}`}
                        key={value.data}
                        onClick={() => {
                            onItemClick(value);
                        }}
                    >
                        {value.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ReportFooterProps {
    onAction: () => void;
}

export const ReportFooter = observer(({ onAction }: ReportFooterProps): ReactElement => {
    const reportStore = useStore().reportStore;
    const navigate = useNavigate();
    const { report, saveReport } = reportStore;
    const toast = useToast();
    const [accessDialogVisible, setAccessDialogVisible] = useState<boolean>(false);

    const handleSaveReport = () => {
        saveReport(report?.itemuid).then((response: BaseResponseError | undefined) => {
            if (response?.status === Status.OK) {
                onAction();
                toast.current?.show({
                    severity: "success",
                    summary: "Success",
                    detail: "New custom report is successfully saved!",
                    life: TOAST_LIFETIME,
                });
            } else {
                toast.current?.show({
                    severity: "error",
                    summary: Status.ERROR,
                    detail: response?.error || "Error while saving new custom report",
                    life: TOAST_LIFETIME,
                });
            }
        });
    };

    const handleToastShow = (status: Status, detail: string) => {
        toast.current?.show({
            severity: status === Status.OK ? "success" : "error",
            summary: status === Status.OK ? "Success" : "Error",
            detail: detail,
            life: TOAST_LIFETIME,
        });
    };

    const handleDuplicateReport = () => {
        report?.itemuid &&
            copyReportDocument(report.itemuid).then((response: BaseResponseError | undefined) => {
                if (response?.status === Status.OK) {
                    navigate("/dashboard/reports");
                    handleToastShow(Status.OK, "Custom report is successfully copied!");
                } else {
                    handleToastShow(Status.ERROR, response?.error!);
                }
            });
    };

    const handleDeleteReport = () => {
        report?.itemuid &&
            deleteReportDocument(report.itemuid).then((response: BaseResponseError | undefined) => {
                if (response?.status === Status.OK) {
                    navigate("/dashboard/reports");
                    handleToastShow(Status.OK, "Custom report is successfully deleted!");
                } else {
                    handleToastShow(Status.ERROR, response?.error!);
                }
            });
    };

    return (
        <>
            <div className='report__footer gap-3 mt-8 mr-3'>
                <Button
                    className='report__icon-button'
                    icon='icon adms-password'
                    severity='success'
                    onClick={() => setAccessDialogVisible(true)}
                    outlined
                />
                <Button
                    className='report__icon-button'
                    icon='icon adms-blank'
                    severity='success'
                    onClick={handleDuplicateReport}
                    outlined
                />
                <Button
                    className='report__icon-button'
                    icon='icon adms-trash-can'
                    onClick={handleDeleteReport}
                    outlined
                    severity='danger'
                />
                <Button
                    className='ml-auto uppercase px-6 report__button'
                    severity='danger'
                    outlined
                >
                    Cancel
                </Button>
                <Button
                    className='uppercase px-6 report__button'
                    disabled={!report.name}
                    severity={!report.name ? "secondary" : "success"}
                    onClick={() => handleSaveReport()}
                >
                    {report?.itemuid ? "Update" : "Create"}
                </Button>
            </div>
            {report.itemuid && (
                <EditAccessDialog
                    visible={accessDialogVisible}
                    onHide={() => setAccessDialogVisible(false)}
                    reportuid={report.itemuid}
                />
            )}
        </>
    );
});
