/* eslint-disable no-unused-vars */
import { MenuItem, MenuItemOptions } from "primereact/menuitem";
import { ReactElement } from "react";

/* eslint-disable jsx-a11y/anchor-is-valid */

export enum ContactAccordionItems {
    GENERAL = "General",
    ADDRESS = "Address",
    MAILING_ADDRESS = "Mailing address",
    IDENTIFICATION = "Identification",
    CONTACTS = "Contacts",
    COMPANY = "Company/Workplace",
    PROSPECTING = "Prospecting and notes",
    DOCUMENTS = "Documents",
}

export interface ContactItem extends MenuItem {
    itemLabel: ContactAccordionItems;
    itemIndex?: number;
    component?: ReactElement;
}

export interface Contact {
    label: string;
    items: ContactItem[];
    sectionId: number;
    startIndex: number;
    getLength: () => number;
}

export class ContactSection implements Contact {
    private static instancesCount: number = 0;
    private static itemIndex: number = 0;
    public sectionId: number;
    public label: string;
    public startIndex: number = 0;
    public items: ContactItem[];

    public constructor({ label, items }: { label: string; items: ContactItem[] }) {
        this.sectionId = ++ContactSection.instancesCount;
        this.label = label;
        this.items = items.map(({ itemLabel, component }) => ({
            itemLabel,
            component,
            itemIndex: ContactSection.itemIndex++,
            template: (item: MenuItem, options: MenuItemOptions) => this.newTemplate(item, options),
        }));
        this.startIndex = ContactSection.itemIndex - this.items.length;
    }

    private newTemplate(item: MenuItem, options: MenuItemOptions): JSX.Element {
        return (
            <a
                href='#'
                role='presentation'
                data-pc-section='action'
                onClick={options.onClick}
                className={`${options.className} vertical-nav flex-row align-items-center justify-content-start w-full`}
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

    public clearCount() {
        ContactSection.itemIndex = 0;
        ContactSection.instancesCount = 0;
    }
}
