import { ReactElement } from "react";
import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import { ContactType } from "common/models/contact";
import { ComboBox } from "dashboard/common/form/dropdown";
import { GlobalSearchInput } from "dashboard/common/form/inputs";
import { ColumnSelector } from "dashboard/common/filter";
import { BUTTON_VARIANTS, ControlButton } from "dashboard/common/button";
import { TableColumnsList } from "dashboard/contacts/common/data-table";

interface ContactsHeaderProps {
    globalSearch: string;
    onGlobalSearchChange: (value: string) => void;
    onAdvancedSearchClick: () => void;
    onCreateContact: () => void;
    onPrint: () => void;
    onDownload: () => void;
    categories: ContactType[];
    selectedCategory: ContactType | null;
    onCategoryChange: (event: DropdownChangeEvent) => void;
    categoryDisabled: boolean;
    selectableColumns: TableColumnsList[];
    activeColumns: TableColumnsList[];
    onColumnsChange: (columns: TableColumnsList[]) => void;
    settingsLoaded: boolean;
}

export default function ContactsHeader({
    globalSearch,
    onGlobalSearchChange,
    onAdvancedSearchClick,
    onCreateContact,
    onPrint,
    onDownload,
    categories,
    selectedCategory,
    onCategoryChange,
    categoryDisabled,
    selectableColumns,
    activeColumns,
    onColumnsChange,
    settingsLoaded,
}: ContactsHeaderProps): ReactElement {
    return (
        <div className='table-controls contact-controls'>
            <GlobalSearchInput
                value={globalSearch}
                onChange={(e) => onGlobalSearchChange(e.target.value)}
            />
            <Button
                className='contact-top-controls__button contact-advanced-search-button'
                label='Advanced search'
                severity='success'
                type='button'
                onClick={onAdvancedSearchClick}
            />
            <ControlButton
                variant={BUTTON_VARIANTS.NEW}
                tooltip='Add new contact'
                onClick={onCreateContact}
            />
            <ControlButton
                variant={BUTTON_VARIANTS.PRINT}
                withTooltip
                tooltipOptions={{ className: "tooltip-tail-left" }}
                onClick={onPrint}
            />
            <ControlButton
                variant={BUTTON_VARIANTS.DOWNLOAD}
                withTooltip
                tooltipOptions={{ className: "tooltip-tail-left" }}
                onClick={onDownload}
            />
            <span className='ml-auto'>
                <ComboBox
                    value={selectedCategory}
                    onChange={onCategoryChange}
                    options={categories}
                    optionLabel='name'
                    editable
                    disabled={categoryDisabled}
                    placeholder='Category'
                    className='category-selector'
                    pt={{
                        wrapper: {
                            style: {
                                maxHeight: "500px",
                            },
                        },
                    }}
                />
            </span>
            <ColumnSelector<TableColumnsList>
                selectableColumns={selectableColumns}
                activeColumns={activeColumns}
                onColumnsChange={(columns) => {
                    if (settingsLoaded) {
                        onColumnsChange(columns);
                    }
                }}
                className='contacts-filter'
            />
        </div>
    );
}
