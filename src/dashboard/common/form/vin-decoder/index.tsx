import { VehicleDecodeInfo, inventoryDecodeVIN } from "http/services/vin-decoder.service";
import { Button } from "primereact/button";
import { InputText, InputTextProps } from "primereact/inputtext";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";

interface VINDecoderProps extends InputTextProps {
    onAction: (vin: VehicleDecodeInfo) => void;
    buttonClassName?: string;
}
export const MIN_VIN_LENGTH = 7;
export const MAX_VIN_LENGTH = 17;

export const VINDecoder = ({
    value,
    onAction,
    onChange,
    disabled,
    buttonClassName,
    ...props
}: VINDecoderProps): ReactElement => {
    const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

    const handleGetVinInfo = () => {
        if (!buttonDisabled) {
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
        value && setButtonDisabled(value.length < MIN_VIN_LENGTH || value.length > MAX_VIN_LENGTH);
    }, [disabled, value, buttonDisabled]);

    return (
        <span className='p-float-label vin-decoder'>
            <InputText
                {...props}
                className={`vin-decoder__text-input ${props.className}`}
                value={value}
                maxLength={MAX_VIN_LENGTH}
                onChange={handleInputChange}
            />
            <Button
                className={`vin-decoder__decode-button ${buttonClassName}`}
                severity={
                    (value && value.length < MIN_VIN_LENGTH) || disabled ? "secondary" : "success"
                }
                disabled={buttonDisabled || disabled}
                type='button'
                onClick={() => value && handleGetVinInfo()}
            >
                Decode
            </Button>
            <label className='float-label'>VIN (required)</label>
        </span>
    );
};
