/* eslint-disable no-unused-vars */
import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { ReactElement } from "react";

/* eslint-disable jsx-a11y/anchor-is-valid */

export interface DealsItem extends MenuItem {
    itemLabel: string;
    itemIndex?: number;
    component?: ReactElement;
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
    ODOMETER = "Odometer",
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

export class DealsSection implements Deals {
    private static instancesCount: number = 0;
    private static itemIndex: number = 0;
    public sectionId: number;
    public label: string;
    public startIndex: number = 0;
    public items: DealsItem[];

    public constructor({ label, items }: { label: string; items: DealsItem[] }) {
        this.sectionId = ++DealsSection.instancesCount;
        this.label = label;
        this.items = items.map(({ itemLabel, component }, index: number) => ({
            itemLabel,
            component,
            itemIndex: DealsSection.itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) => {
                return this.newTemplate(item, options, index);
            },
        }));
        this.startIndex = DealsSection.itemIndex - this.items.length;
    }

    private newTemplate(
        item: MenuItem,
        { props, onClick, className, labelClassName }: MenuItemOptions,
        index: number
    ): JSX.Element {
        const isGreen =
            (DealsSection.instancesCount > this.items.length || index <= props.activeIndex) &&
            props.activeIndex !== 0;

        return (
            <a
                href='#'
                onClick={onClick}
                className={`${className} vertical-nav flex-row align-items-center justify-content-start w-full`}
            >
                <label
                    className={`vertical-nav__icon p-steps-number ${
                        isGreen && "p-steps-number--green"
                    } border-circle`}
                />
                <span className={`${labelClassName} vertical-nav__label`}>{item.label}</span>
            </a>
        );
    }

    public clearCount() {
        DealsSection.itemIndex = 0;
        DealsSection.instancesCount = 0;
    }

    public getLength(): number {
        return this.items.length;
    }
}
