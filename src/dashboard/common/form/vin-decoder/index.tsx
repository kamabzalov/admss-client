import { VehicleDecodeInfo, inventoryDecodeVIN } from "http/services/vin-decoder.service";
import { Button } from "primereact/button";
import { InputText, InputTextProps } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";

interface VINDecoderProps extends InputTextProps {
    onAction: (vin: VehicleDecodeInfo) => void;
    buttonClassName?: string;
}
export const MIN_VIN_LENGTH = 1;
export const MAX_VIN_LENGTH = 17;

const validateVin = (vin: string): boolean => {
    return typeof vin === "string" && vin.length >= 1 && vin.length <= 17;
};

export const VINDecoder = ({
    value,
    onAction,
    onChange,
    disabled,
    buttonClassName,
    ...props
}: VINDecoderProps): ReactElement => {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

    const handleGetVinInfo = () => {
        if (!buttonDisabled && value && validateVin(value)) {
            inventoryDecodeVIN(value).then((response) => {
                if (response) {
                    onAction(response);
                }
            });
        }
    };

    const handleInputChange = (event: any) => {
        onChange && onChange(event);
    };

    useEffect(() => {
        if (value) {
            const valueLength = value.replaceAll(" ", "").length;
            setButtonDisabled(valueLength < MIN_VIN_LENGTH || valueLength > MAX_VIN_LENGTH);
        } else {
            setButtonDisabled(true);
        }
    }, [disabled, value, buttonDisabled]);

    return (
        <span className='p-float-label vin-decoder'>
            <InputText
                {...props}
                className={`vin-decoder__text-input ${props.className}`}
                value={value}
                onChange={handleInputChange}
            />
            <Button
                className={`vin-decoder__decode-button ${buttonClassName}`}
                disabled={buttonDisabled || disabled}
                type='button'
                onClick={handleGetVinInfo}
            >
                Decode
            </Button>
            <label className='float-label'>VIN (required)</label>
        </span>
    );
};
