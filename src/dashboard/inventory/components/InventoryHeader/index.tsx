import { ReactElement } from "react";
import { Button } from "primereact/button";
import {
    MultiSelect,
    MultiSelectChangeEvent,
    MultiSelectPanelHeaderTemplateEvent,
} from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { FilterOptions, TableColumnsList } from "dashboard/inventory/common/data-table";

interface InventoryHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onAdvancedSearch: () => void;
    onAddNew: () => void;
    onPrint: () => void;
    onDownload: () => void;
    filterOptions: FilterOptions[];
    selectedFilterValues: Pick<FilterOptions, "value">[];
    onFilterOptionsChange: (selected: FilterOptions[]) => void;
    availableColumns: TableColumnsList[];
    activeColumns: TableColumnsList[];
    onActiveColumnsChange: (columns: TableColumnsList[]) => void;
    inventoryTypes: { description: string }[];
    selectedInventoryTypes: string[];
    onInventoryTypesChange: (values: string[]) => void;
}

export default function InventoryHeader({
    searchValue,
    onSearchChange,
    onAdvancedSearch,
    onAddNew,
    onPrint,
    onDownload,
    filterOptions,
    selectedFilterValues,
    onFilterOptionsChange,
    availableColumns,
    activeColumns,
    onActiveColumnsChange,
    inventoryTypes,
    selectedInventoryTypes,
    onInventoryTypesChange,
}: InventoryHeaderProps): ReactElement {
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

    const dropdownFilterHeaderPanel = (evt: MultiSelectPanelHeaderTemplateEvent) => {
        const enabledOptions = filterOptions.filter((option) => !option.disabled);
        const allSelected = enabledOptions.length === selectedFilterValues.length;
        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        checked={allSelected}
                        onChange={(e) => {
                            const isChecked = e.target.checked;
                            const selected = isChecked ? filterOptions : [];
                            onFilterOptionsChange(selected.filter((option) => !option.disabled));
                        }}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    className='p-multiselect-close p-link'
                    onClick={(event) => {
                        onFilterOptionsChange([]);
                        evt.onCloseClick(event);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

    const dropdownTypeHeaderPanel = ({ onCloseClick }: MultiSelectPanelHeaderTemplateEvent) => {
        const allSelected = selectedInventoryTypes.length === inventoryTypes.length;
        return (
            <div className='dropdown-header flex pb-1'>
                <label className='cursor-pointer dropdown-header__label'>
                    <Checkbox
                        checked={allSelected}
                        onChange={() => {
                            if (!allSelected) {
                                onInventoryTypesChange(
                                    inventoryTypes.map(({ description }) => description)
                                );
                            } else {
                                onInventoryTypesChange([]);
                            }
                        }}
                        className='dropdown-header__checkbox mr-2'
                    />
                    Select All
                </label>
                <button
                    className='p-multiselect-close p-link'
                    onClick={(event) => {
                        onInventoryTypesChange([]);
                        onCloseClick(event);
                    }}
                >
                    <i className='pi pi-times' />
                </button>
            </div>
        );
    };

    return (
        <div className='datatable-controls'>
            <GlobalSearchInput value={searchValue} onInputChange={onSearchChange} enableDebounce />
            <Button
                className='inventory-top-controls__search-button'
                label='Advanced search'
                severity='success'
                type='button'
                onClick={onAdvancedSearch}
            />
            <Button
                className='inventory-top-controls__button new-inventory-button'
                icon='icon adms-add-item'
                severity='success'
                type='button'
                tooltip='Add new inventory'
                onClick={onAddNew}
            >
                New
            </Button>
            <Button
                className='inventory-top-controls__button'
                severity='success'
                type='button'
                icon='icon adms-print'
                tooltip='Print inventory form'
                onClick={onPrint}
            />
            <Button
                className='inventory-top-controls__button'
                severity='success'
                type='button'
                icon='icon adms-download'
                tooltip='Download inventory form'
                onClick={onDownload}
            />
            <MultiSelect
                optionValue='value'
                optionLabel='label'
                options={filterOptions}
                value={selectedFilterValues}
                onChange={({ value }: MultiSelectChangeEvent) => {
                    const selected = filterOptions.filter((option) => value.includes(option.value));
                    onFilterOptionsChange(selected);
                }}
                placeholder='Filter'
                className='inventory-dropdown inventory-filter ml-auto'
                display='chip'
                selectedItemsLabel='Clear Filter'
                panelHeaderTemplate={dropdownFilterHeaderPanel}
                pt={{
                    header: { className: "inventory-filter__header" },
                    wrapper: {
                        className: "inventory-filter__wrapper",
                        style: { maxHeight: "500px", maxWidth: "230px" },
                    },
                }}
            />
            <MultiSelect
                options={availableColumns}
                value={activeColumns}
                optionLabel='header'
                onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                    stopPropagation();
                    const sortedValue = value.sort((a: TableColumnsList, b: TableColumnsList) => {
                        const firstIndex = availableColumns.findIndex(
                            (col) => col.field === a.field
                        );
                        const secondIndex = availableColumns.findIndex(
                            (col) => col.field === b.field
                        );
                        return firstIndex - secondIndex;
                    });
                    onActiveColumnsChange(sortedValue);
                }}
                panelHeaderTemplate={dropdownHeaderPanel}
                className='inventory-dropdown column-picker'
                display='chip'
                pt={{
                    header: { className: "column-picker__header" },
                    wrapper: {
                        className: "column-picker__wrapper",
                        style: { maxHeight: "500px", maxWidth: "230px" },
                    },
                }}
            />
            <MultiSelect
                optionValue='description'
                optionLabel='description'
                options={inventoryTypes}
                value={selectedInventoryTypes}
                onChange={({ value, stopPropagation }: MultiSelectChangeEvent) => {
                    stopPropagation();
                    onInventoryTypesChange(value);
                }}
                placeholder='Inventory Type'
                className='inventory-dropdown inventory-filter'
                display='chip'
                selectedItemsLabel='Clear Filter'
                panelHeaderTemplate={dropdownTypeHeaderPanel}
                pt={{
                    header: { className: "inventory-filter__header" },
                    wrapper: {
                        className: "inventory-filter__wrapper",
                        style: { maxHeight: "500px", maxWidth: "230px" },
                    },
                }}
            />
        </div>
    );
}
