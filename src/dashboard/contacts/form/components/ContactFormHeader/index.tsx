import { ReactElement, useMemo } from "react";
import { Contact } from "common/models/contact";
import { EntityFormHeader, EntityFormHeaderItem } from "dashboard/common/entity-form-layout";

interface ContactFormHeaderProps {
    id?: string;
    contact: Contact;
}

export default function ContactFormHeader({ id, contact }: ContactFormHeaderProps): ReactElement {
    const metadata = useMemo((): EntityFormHeaderItem[] => {
        if (!id) {
            return [];
        }

        const items: EntityFormHeaderItem[] = [];

        if (contact.firstName || contact.lastName) {
            items.push({
                label: "Full Name",
                value: `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            });
        }

        if (contact.businessName) {
            items.push({
                label: "Company name",
                value: contact.businessName,
            });
        }

        return items;
    }, [id, contact.firstName, contact.lastName, contact.businessName]);

    return <EntityFormHeader title={`${id ? "Edit" : "Create new"} contact`} metadata={metadata} />;
}
