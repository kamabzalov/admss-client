import { ReportDocument } from "common/models/reports";
import { DateInput } from "dashboard/common/form/inputs";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";

interface ReportParametersProps {
    report: ReportDocument;
    handleClosePanel?: () => void;
}

export const ReportParameters = ({
    report,
    handleClosePanel,
}: ReportParametersProps): ReactElement => {
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

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
                    >
                        Preview
                    </Button>
                    <Button
                        className='edit-collection__button'
                        disabled={isButtonDisabled}
                        severity={isButtonDisabled ? "secondary" : "success"}
                        type='button'
                        outlined
                    >
                        Download
                    </Button>
                </div>
            </div>
        </div>
    );
};
