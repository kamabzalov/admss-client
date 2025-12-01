import { ReactElement } from "react";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { TruncatedText } from "dashboard/common/display";
import { ACCOUNT_AUDIT_TYPES } from "common/constants/account-options";

interface AuditHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onPrint: () => void;
    onDownload: () => void;
    isLoading: boolean;
    selectedAccountType: ACCOUNT_AUDIT_TYPES | undefined;
    onAccountTypeChange: (type: ACCOUNT_AUDIT_TYPES) => void;
}

export default function AuditHeader({
    searchValue,
    onSearchChange,
    onPrint,
    onDownload,
    isLoading,
    selectedAccountType,
    onAccountTypeChange,
}: AuditHeaderProps): ReactElement {
    const accountTypeOptions = [
        { name: "Activity For Today", value: ACCOUNT_AUDIT_TYPES.ACTIVITY_FOR_TODAY },
        { name: "Activity In Past 7 Days", value: ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_7_DAYS },
        { name: "Activity In Past 31 Days", value: ACCOUNT_AUDIT_TYPES.ACTIVITY_IN_PAST_31_DAYS },
        { name: "Insurance Missing", value: ACCOUNT_AUDIT_TYPES.INSURANCE_MISSING },
        { name: "Missing Policies", value: ACCOUNT_AUDIT_TYPES.MISSING_POLICIES },
        { name: "Missing Titles", value: ACCOUNT_AUDIT_TYPES.MISSING_TITLES },
        { name: "Notes Taken Today", value: ACCOUNT_AUDIT_TYPES.NOTES_TAKEN_TODAY },
        { name: "Notes Taken Yesterday", value: ACCOUNT_AUDIT_TYPES.NOTES_TAKEN_YESTERDAY },
        { name: "Promises Taken Today", value: ACCOUNT_AUDIT_TYPES.PROMISES_TAKEN_TODAY },
        { name: "Promises Taken Yesterday", value: ACCOUNT_AUDIT_TYPES.PROMISES_TAKEN_YESTERDAY },
    ];

    const accountTypeItemTemplate = (option: { name: string; value: string }) => {
        return <div className='accounts-filter__item'>{option?.name}</div>;
    };

    const accountTypeSelectedItemTemplate = (option: { name: string; value: string }) => {
        return (
            <TruncatedText className='accounts-filter__selected' withTooltip text={option?.name} />
        );
    };

    return (
        <div className='datatable-controls'>
            <span className='p-float-label accounts-filter-wrapper'>
                <Dropdown
                    optionValue='value'
                    optionLabel='name'
                    inputId='account-type-input'
                    value={selectedAccountType}
                    options={accountTypeOptions}
                    valueTemplate={accountTypeSelectedItemTemplate}
                    className='audit-filter'
                    itemTemplate={accountTypeItemTemplate}
                    onChange={(e: DropdownChangeEvent) => {
                        onAccountTypeChange(e.value);
                    }}
                    panelClassName='audit-filter__panel'
                    scrollHeight='calc(100vh - 200px)'
                />
                <label className='float-label' htmlFor='account-type-input'>
                    Filter by
                </label>
            </span>
            <Button
                severity='success'
                type='button'
                icon='icon adms-print'
                tooltip='Print accounts form'
                onClick={onPrint}
                disabled={isLoading}
            />
            <Button
                severity='success'
                type='button'
                icon='icon adms-download'
                tooltip='Download accounts form'
                onClick={onDownload}
                disabled={isLoading}
            />

            <div className='ml-auto'>
                <GlobalSearchInput
                    value={searchValue}
                    onInputChange={onSearchChange}
                    enableDebounce
                />
            </div>
        </div>
    );
}
