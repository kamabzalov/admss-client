import { Status } from "common/models/base-response";
import { ReportDocument } from "common/models/reports";
import { TOAST_LIFETIME } from "common/settings";
import { DateInput } from "dashboard/common/form/inputs";
import { useToast } from "dashboard/common/toast";
import { setReportDocumentTemplate } from "http/services/reports.service";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import { useStore } from "store/hooks";

interface ReportParametersProps {
    report: ReportDocument;
    handleClosePanel?: () => void;
}

const todayDate = new Date().toISOString().split("T")[0];

export const ReportParameters = ({
    report,
    handleClosePanel,
}: ReportParametersProps): ReactElement => {
    const userStore = useStore().userStore;
    const toast = useToast();
    const { authUser } = userStore;
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string>(todayDate);
    const [endDate, setEndDate] = useState<string>(todayDate);

    useEffect(() => {
        if (!startDate || !endDate) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    }, [startDate, endDate]);

    const handleCloseClick = () => {
        handleClosePanel?.();
    };

    const handleDownloadForm = async (download: boolean = false) => {
        const errorMessage = "Error while download report";
        if (authUser && authUser.useruid) {
            const response = await setReportDocumentTemplate(report.documentUID || "0", {
                itemUID: report.documentUID || "0",
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
                link.download = `report_form_${report.documentUID || report.name}.pdf`;
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
        <div className='report-parameters'>
            <h3 className='report-parameters__title'>Parameters</h3>
            {handleClosePanel && (
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={handleCloseClick}
                />
            )}
            <div className='grid report-parameters__form mt-3'>
                <DateInput
                    name='Start Date'
                    colWidth={3}
                    value={startDate}
                    onChange={({ value }) => setStartDate(String(value))}
                />
                <DateInput
                    name='End Date'
                    colWidth={3}
                    value={endDate}
                    onChange={({ value }) => setEndDate(String(value))}
                />
                <div className='col-12 flex justify-content-end gap-3'>
                    <Button
                        className='edit-collection__button'
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        type='button'
                        outlined
                        onClick={() => handleDownloadForm()}
                    >
                        Preview
                    </Button>
                    <Button
                        className='edit-collection__button'
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        type='button'
                        outlined
                        onClick={() => handleDownloadForm(true)}
                    >
                        Download
                    </Button>
                </div>
            </div>
        </div>
    );
};
