import { MenuItem, MenuItemOptions } from "primereact/menuitem";

/* eslint-disable jsx-a11y/anchor-is-valid */

export interface InventoryItem extends MenuItem {
    itemLabel: string;
    itemIndex?: number;
    component?: JSX.Element;
}

export interface Inventory {
    label: string;
    items: InventoryItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export class InventorySection implements Inventory {
    static instancesCount: number = 0;
    static itemIndex: number = 0;
    sectionId: number;
    label: string;
    startIndex: number = 0;
    items: InventoryItem[];

    constructor({ label, items }: { label: string; items: InventoryItem[] }) {
        this.sectionId = ++InventorySection.instancesCount;
        this.label = label;
        this.items = items.map(({ itemLabel, component }) => ({
            itemLabel,
            component,
            itemIndex: InventorySection.itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) => this.newTemplate(item, options),
        }));
        this.startIndex = InventorySection.itemIndex - this.items.length;
    }

    private newTemplate(item: MenuItem, options: MenuItemOptions): JSX.Element {
        return (
            <a
                href='#'
                className={`${options.className} vertical-nav flex-row align-items-center justify-content-start w-full`}
                role='presentation'
                data-pc-section='action'
            >
                <label
                    className={"vertical-nav__icon p-steps-number border-circle "}
                    data-pc-section='step'
                />
                <span
                    className={`${options.labelClassName} vertical-nav__label`}
                    data-pc-section='label'
                >
                    {item.label}
                </span>
            </a>
        );
    }

    public getLength(): number {
        return this.items.length;
    }
}
