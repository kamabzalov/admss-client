import { ChangeEvent, ReactElement, useId, useRef } from "react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Tooltip } from "primereact/tooltip";
import { Loader } from "dashboard/common/loader";
import { contactFormTooltipOptions } from "dashboard/contacts/form/common/tooltip";

const SCAN_DL_TOOLTIP = "Data received from the DL's backside will fill in related fields";
const OVERWRITE_TOOLTIP = "Data received from the DL's backside will overwrite user-entered data";

interface ScanDlControlsProps {
    checkboxId: string;
    isScanning: boolean;
    allowOverwrite: boolean;
    onAllowOverwriteChange: (allowOverwrite: boolean) => void;
    onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const ScanDlControls = ({
    checkboxId,
    isScanning,
    allowOverwrite,
    onAllowOverwriteChange,
    onFileChange,
    className = "col-12 flex gap-4",
}: ScanDlControlsProps): ReactElement => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const overwriteHelpTooltipId = useId();

    return (
        <div className={className}>
            <Button
                type='button'
                label={isScanning ? "Scanning" : "Scan driver license"}
                className={`general-info__button ${isScanning ? "general-info__button--loading" : ""}`}
                tooltip={SCAN_DL_TOOLTIP}
                tooltipOptions={contactFormTooltipOptions({ position: "right" })}
                outlined={!isScanning}
                onClick={() => fileInputRef.current?.click()}
                loading={isScanning}
                loadingIcon={<Loader size='small' includeText={false} color='white' />}
            />
            <input
                type='file'
                accept='image/*'
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={onFileChange}
            />
            <div className='general-info-overwrite'>
                <Checkbox
                    checked={allowOverwrite}
                    inputId={checkboxId}
                    className='general-info-overwrite__checkbox'
                    onChange={() => onAllowOverwriteChange(!allowOverwrite)}
                />
                <label htmlFor={checkboxId} className='general-info-overwrite__label'>
                    Overwrite data
                </label>
                <i
                    className='icon adms-help general-info-overwrite__icon'
                    data-tooltip-id={overwriteHelpTooltipId}
                />
                <Tooltip
                    target={`[data-tooltip-id="${overwriteHelpTooltipId}"]`}
                    content={OVERWRITE_TOOLTIP}
                    {...contactFormTooltipOptions({
                        position: "right",
                        style: { maxWidth: "320px" },
                    })}
                />
            </div>
        </div>
    );
};
