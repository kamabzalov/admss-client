import { ReactElement } from "react";
import { Button } from "primereact/button";
import {
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectPanelHeaderTemplateEvent,
} from "primereact/multiselect";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { TableColumnsList } from "dashboard/accounts/common/data-table";
import { TruncatedText } from "dashboard/common/display";

interface AccountsHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onAdvancedSearch: () => void;
    onPrint: () => void;
    onDownload: () => void;
    isLoading: boolean;
    availableColumns: TableColumnsList[];
    activeColumns: TableColumnsList[];
    onActiveColumnsChange: (columns: TableColumnsList[]) => void;
    selectedAccountType: string;
    onAccountTypeChange: (type: string) => void;
}

export default function AccountsHeader({
    searchValue,
    onSearchChange,
    onAdvancedSearch,
    onPrint,
    onDownload,
    isLoading,
    availableColumns,
    activeColumns,
    onActiveColumnsChange,
    selectedAccountType,
    onAccountTypeChange,
}: AccountsHeaderProps): ReactElement {
    const accountTypeOptions = [
        { name: "Buy Here Pay Here", value: "Buy Here Pay Here" },
        { name: "Cash Deal", value: "Cash Deal" },
        { name: "Cash Deal with Outside Financing", value: "Cash Deal with Outside Financing" },
        { name: "Cash Deal with Outside Lease", value: "Cash Deal with Outside Lease" },
        { name: "Cash Deal for Related Finance", value: "Cash Deal for Related Finance" },
        { name: "Wholesale", value: "Wholesale" },
        { name: "Dismantled", value: "Dismantled" },
        { name: "Lease Here Pay Here", value: "Lease Here Pay Here" },
    ];

    const dropdownHeaderPanel = ({ onCloseClick }: MultiSelectPanelHeaderTemplateEvent) => {
        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        onChange={() => {
                            if (availableColumns.length === activeColumns.length) {
                                onActiveColumnsChange(
                                    availableColumns.filter(({ checked }) => checked)
                                );
                            } else {
                                onActiveColumnsChange(availableColumns);
                            }
                        }}
                        checked={availableColumns.length === activeColumns.length}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    className='p-multiselect-close p-link'
                    onClick={(event) => {
                        onActiveColumnsChange(availableColumns.filter(({ checked }) => checked));
                        onCloseClick(event);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

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
            <GlobalSearchInput value={searchValue} onInputChange={onSearchChange} enableDebounce />
            <Button
                className='contact-top-controls__button'
                label='Advanced search'
                severity='success'
                type='button'
                onClick={onAdvancedSearch}
            />
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
            <span className='p-float-label accounts-filter-wrapper ml-auto'>
                <Dropdown
                    optionValue='value'
                    optionLabel='name'
                    inputId='account-type-input'
                    value={selectedAccountType}
                    options={accountTypeOptions}
                    valueTemplate={accountTypeSelectedItemTemplate}
                    className='accounts-filter'
                    itemTemplate={accountTypeItemTemplate}
                    onChange={(e: DropdownChangeEvent) => {
                        onAccountTypeChange(e.value);
                    }}
                />
                <label className='float-label' htmlFor='account-type-input'>
                    Type
                </label>{" "}
                {selectedAccountType && (
                    <Button
                        icon='pi pi-times'
                        type='button'
                        className='accounts-filter__clear-button'
                        onClick={() => onAccountTypeChange("")}
                    />
                )}
            </span>
            <MultiSelect
                options={availableColumns}
                value={activeColumns}
                optionLabel='header'
                onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                    stopPropagation();
                    const sortedValue = value.sort((a: TableColumnsList, b: TableColumnsList) => {
                        const firstIndex = availableColumns.findIndex(
                            (column) => column.field === a.field
                        );
                        const secondIndex = availableColumns.findIndex(
                            (column) => column.field === b.field
                        );
                        return firstIndex - secondIndex;
                    });
                    onActiveColumnsChange(sortedValue);
                }}
                panelHeaderTemplate={dropdownHeaderPanel}
                className='accounts-dropdown column-picker'
                display='chip'
                pt={{
                    header: { className: "column-picker__header" },
                    wrapper: {
                        className: "column-picker__wrapper",
                        style: { maxHeight: "500px", maxWidth: "230px" },
                    },
                }}
            />
        </div>
    );
}
