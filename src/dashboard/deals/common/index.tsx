import { TableColumnsList } from "dashboard/deals";
import { Checkbox } from "primereact/checkbox";
import { MultiSelectPanelHeaderTemplateEvent } from "primereact/multiselect";
import {
    createFormStepSections,
    FormStepItem,
    FormStepSection,
    FormStepSectionInput,
    getFormStepMenuCount,
    resetFormStepSectionCounters,
} from "dashboard/common/form-stepper";

export interface DealsItem extends FormStepItem {
    itemLabel: string;
}

export interface Deals {
    label: string;
    items: DealsItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export enum AccordionDealItems {
    SALE = "Sale",
    ODOMETER = "Odometer Disclosure",
    SELLER = "Seller",
    LIENS = "Liens",
    FIRST_TRADE = "Trade 1",
    SECOND_TRADE = "Trade 2",
    TAG = "Tag",
    INSURANCE = "Insurance",
    CHARGES = "Insurance Charges",
    PRODUCTS = "F&I products",
    FINANCES = "Finances",
    PICKUP = "Pickup payments",
    CONTRACT = "Contract Printing",
    LHPH = "LHPH",
    BHPH = "BHPH",
    DISMANTLE = "Dismantle",
}

export type DealsSection = FormStepSection;

export const createDealsSections = (sectionInputs: FormStepSectionInput[]): DealsSection[] =>
    createFormStepSections(sectionInputs);

export { getFormStepMenuCount as getDealsMenuCount, resetFormStepSectionCounters };

interface DropdownHeaderPanelProps extends Partial<MultiSelectPanelHeaderTemplateEvent> {
    columns: TableColumnsList[];
    activeColumns: TableColumnsList[];
    setActiveColumns: (columns: TableColumnsList[]) => void;
}

export const DropdownHeaderPanel = ({
    onCloseClick,
    columns,
    activeColumns,
    setActiveColumns,
}: DropdownHeaderPanelProps) => {
    return (
        <div className='dropdown-header flex pb-1'>
            <label className='cursor-pointer dropdown-header__label'>
                <Checkbox
                    onChange={() => {
                        if (columns.length === activeColumns.length) {
                            setActiveColumns(columns.filter(({ checked }) => checked));
                        } else {
                            setActiveColumns(columns);
                        }
                    }}
                    checked={columns.length === activeColumns.length}
                    className='dropdown-header__checkbox mr-2'
                />
                Select All
            </label>
            <button
                className='p-multiselect-close p-link'
                onClick={(e) => {
                    setActiveColumns(columns.filter(({ checked }) => checked));
                    onCloseClick?.(e);
                }}
            >
                <i className='pi pi-times' />
            </button>
        </div>
    );
};
