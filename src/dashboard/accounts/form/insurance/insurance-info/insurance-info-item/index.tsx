import { ReactElement } from "react";
import { DateInput, TextInput } from "dashboard/common/form/inputs";
import { CalendarChangeEvent } from "primereact/calendar";

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
    const handleDateChange = (e: CalendarChangeEvent) => {
        const selectedDate = e.value as Date | null;
        if (selectedDate && onChange) {
            const dateInMs = selectedDate.getTime();
            onChange(dateInMs.toString());
        }
    };
    if (editMode) {
        return inputType === "date" ? (
            <DateInput
                id='account-insurance-title-num'
                className='insurance-info__input w-full'
                value={value}
                name={label}
                date={value ? Number(value) : undefined}
                emptyDate
                onChange={handleDateChange}
            />
        ) : (
            <TextInput
                name={label}
                label={label}
                className='insurance-info__input w-full'
                value={value || ""}
                onChange={(e) => onChange && onChange(e.target.value)}
            />
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
