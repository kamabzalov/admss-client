import "./index.css";
import { DataTableWrapper } from "dashboard/common/data-table";
import { ContactsDataTable } from "dashboard/contacts/common/contacts-data-table";

export { ContactsDataTable } from "dashboard/contacts/common/contacts-data-table";
export type { ContactsDataTableProps } from "dashboard/contacts/common/contacts-data-table";

export const Contacts = () => {
    return (
        <DataTableWrapper className='card contacts'>
            <div className='card-header'>
                <h2 className='card-header__title uppercase m-0'>Contacts</h2>
            </div>
            <ContactsDataTable />
        </DataTableWrapper>
    );
};
