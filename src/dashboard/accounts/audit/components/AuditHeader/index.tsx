import { ReactElement } from "react";
import { Button } from "primereact/button";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { TruncatedText } from "dashboard/common/display";

interface AuditHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onPrint: () => void;
    onDownload: () => void;
    isLoading: boolean;
    selectedAccountType: string;
    onAccountTypeChange: (type: string) => void;
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
        { name: "Activity For Today", value: "Activity For Today" },
        { name: "Activity In Past 7 Days", value: "Activity In Past 7 Days" },
        { name: "Activity In Past 31 Days", value: "Activity In Past 31 Days" },
        { name: "Insurance Missing", value: "Insurance Missing" },
        { name: "Missing Policies", value: "Missing Policies" },
        { name: "Missing Titles", value: "Missing Titles" },
        { name: "Notes Taken Today", value: "Notes Taken Today" },
        { name: "Notes Taken Yesterday", value: "Notes Taken Yesterday" },
        { name: "Promises Taken Today", value: "Promises Taken Today" },
        { name: "Promises Taken Yesterday", value: "Promises Taken Yesterday" },
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
                {selectedAccountType && (
                    <Button
                        icon='pi pi-times'
                        type='button'
                        className='audit-filter__clear-button'
                        onClick={() => onAccountTypeChange("")}
                    />
                )}
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
