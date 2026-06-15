import { ReactElement } from "react";
import { Tooltip } from "primereact/tooltip";
import { Contact } from "common/models/contact";
import { truncateText } from "common/helpers";

interface ContactFormHeaderProps {
    id?: string;
    contact: Contact;
}

export default function ContactFormHeader({ id, contact }: ContactFormHeaderProps): ReactElement {
    return (
        <div className='card-header'>
            <h2 className='card-header__title uppercase m-0 pr-2'>
                {id ? "Edit" : "Create new"} contact
            </h2>
            {id && (
                <div className='card-header-info'>
                    <Tooltip target='.tooltip-target' className='tooltip-tail-bottom' />

                    {(contact.firstName || contact.lastName) && (
                        <>
                            Full Name
                            <span
                                className='card-header-info__data tooltip-target'
                                data-pr-tooltip={`${contact.firstName || ""} ${contact.lastName || ""}`}
                                data-pr-position='top'
                            >
                                {truncateText(
                                    `${contact.firstName || ""} ${contact.lastName || ""}`
                                )}
                            </span>
                        </>
                    )}

                    {contact?.businessName && (
                        <>
                            Company name
                            <span
                                className='card-header-info__data tooltip-target'
                                data-pr-tooltip={contact.businessName}
                                data-pr-position='top'
                            >
                                {truncateText(contact.businessName)}
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
