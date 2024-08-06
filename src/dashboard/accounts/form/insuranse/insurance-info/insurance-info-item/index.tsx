import { ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { DateInput } from "dashboard/common/form/inputs";

interface EditableFieldProps {
    label: string;
    value: string | undefined;
    onChange?: (value: string) => void;
    editMode: boolean;
    inputType?: "text" | "date";
}

export const InsuranceInfoField = ({
    label,
    value,
    editMode,
    onChange,
    inputType = "text",
}: EditableFieldProps): ReactElement => {
    if (editMode) {
        return inputType === "date" ? (
            <DateInput
                id='account-insurance-title-num'
                className='insurance-info__input w-full'
                value={value || ""}
                onChange={(e) => onChange && onChange(e.target.value as string)}
            />
        ) : (
            <span className='p-float-label'>
                <InputText
                    id='account-insurance-title-num'
                    className='insurance-info__input w-full'
                    value={value || ""}
                    onChange={(e) => onChange && onChange(e.target.value)}
                />{" "}
                <label className='float-label'>{label}</label>
            </span>
        );
    } else {
        return (
            <div className='insurance-field'>
                <label className='insurance-field__label'>{label}:</label>
                <span className='insurance-field__value'>{value}</span>
            </div>
        );
    }
};

