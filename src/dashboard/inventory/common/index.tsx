import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { ReactElement } from "react";

/* eslint-disable jsx-a11y/anchor-is-valid */

export interface InventoryItem extends MenuItem {
    itemLabel: string;
    itemIndex?: number;
    component?: ReactElement;
}

export interface Inventory {
    label: string;
    items: InventoryItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

interface MenuOptions extends MenuItemOptions {
    active: boolean;
}

export class InventorySection implements Inventory {
    private static instancesCount: number = 0;
    private static itemIndex: number = 0;
    private _activeIndex: number = 0;
    public sectionId: number;
    public label: string;
    public startIndex: number = 0;
    public items: InventoryItem[];

    set activeIndex(value: number) {
        this._activeIndex = value;
    }

    public constructor({ label, items }: { label: string; items: InventoryItem[] }) {
        this.sectionId = ++InventorySection.instancesCount;
        this.label = label;
        this.items = items.map(({ itemLabel, component }, index: number) => ({
            itemLabel,
            component,
            itemIndex: InventorySection.itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) => {
                (options as MenuOptions)?.active && (this._activeIndex = index);
                return this.newTemplate(item, options, index);
            },
        }));
        this.startIndex = InventorySection.itemIndex - this.items.length;
    }

    private newTemplate(item: MenuItem, options: MenuItemOptions, index: number): JSX.Element {
        return (
            <a
                href='#'
                role='presentation'
                data-pc-section='action'
                onClick={options.onClick}
                className={`${options.className} vertical-nav flex-row align-items-center justify-content-start w-full`}
            >
                <label
                    className={`vertical-nav__icon p-steps-number ${
                        InventorySection.instancesCount > this.items.length ||
                        (index <= this._activeIndex && "p-steps-number--green")
                    } border-circle`}
                />
                <span className={`${options.labelClassName} vertical-nav__label`}>
                    {item.label}
                </span>
            </a>
        );
    }

    public getLength(): number {
        return this.items.length;
    }
}
