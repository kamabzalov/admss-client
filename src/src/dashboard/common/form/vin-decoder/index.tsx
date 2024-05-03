import { VehicleDecodeInfo, inventoryDecodeVIN } from "http/services/vin-decoder.service";
import { Button } from "primereact/button";
import { InputText, InputTextProps } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";

interface VINDecoderProps extends InputTextProps {
    onAction: (vin: VehicleDecodeInfo) => void;
}
const MIN_VIN_LENGTH = 7;
const VIN_VALID_LENGTH = 17;

export const VINDecoder = ({
    value,
    onAction,
    onChange,
    disabled,
    ...props
}: VINDecoderProps): ReactElement => {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    const handleGetVinInfo = (vin: string) => {
        if (vin.length === VIN_VALID_LENGTH) {
            value &&
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
        value &&
            setButtonDisabled(value.length < MIN_VIN_LENGTH || value.length > VIN_VALID_LENGTH);
    }, [disabled, value, buttonDisabled]);

    return (
        <span className='p-float-label vin-decoder'>
            <InputText
                className={`vin-decoder__text-input`}
                value={value}
                maxLength={VIN_VALID_LENGTH}
                onChange={handleInputChange}
                {...props}
            />
            <Button
                className='vin-decoder__decode-button'
                severity={
                    (value && value.length < MIN_VIN_LENGTH) || disabled ? "secondary" : "success"
                }
                disabled={buttonDisabled || disabled}
                onClick={() => value && handleGetVinInfo(value)}
            >
                Decode
            </Button>
            <label className='float-label'>VIN (required)</label>
        </span>
    );
};
