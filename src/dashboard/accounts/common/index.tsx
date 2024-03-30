import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { ReactElement } from "react";

/* eslint-disable jsx-a11y/anchor-is-valid */

export interface AccountsItem extends MenuItem {
    itemLabel: string;
    itemIndex?: number;
    component?: ReactElement;
}

export interface Accounts {
    label: string;
    items: AccountsItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export class AccountsSection implements Accounts {
    private static instancesCount: number = 0;
    private static itemIndex: number = 0;
    public sectionId: number;
    public label: string;
    public startIndex: number = 0;
    public items: AccountsItem[];

    public constructor({ label, items }: { label: string; items: AccountsItem[] }) {
        this.sectionId = ++AccountsSection.instancesCount;
        this.label = label;
        this.items = items.map(({ itemLabel, component }, index: number) => ({
            itemLabel,
            component,
            itemIndex: AccountsSection.itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) => {
                return this.newTemplate(item, options, index);
            },
        }));
        this.startIndex = AccountsSection.itemIndex - this.items.length;
    }

    private newTemplate(
        item: MenuItem,
        { props, onClick, className, labelClassName }: MenuItemOptions,
        index: number
    ): JSX.Element {
        const isGreen =
            (AccountsSection.instancesCount > this.items.length || index <= props.activeIndex) &&
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
        AccountsSection.itemIndex = 0;
        AccountsSection.instancesCount = 0;
    }

    public getLength(): number {
        return this.items.length;
    }
}
