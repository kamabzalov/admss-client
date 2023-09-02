import React, { useEffect, useState } from 'react';
import './index.css';
import { Button } from 'primereact/button';
import {
    ContactType,
    ContactUser,
    getContactsByUserId,
    getContactsCategories,
} from '../../http/services/contacts-service';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { AuthUser } from '../../http/services/auth.service';
import { getKeyValue } from '../../services/local-storage.service';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Contacts() {
    const [categories, setCategories] = useState<ContactType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ContactType | null>(null);
    const [, setUser] = useState<AuthUser | null>(null);
    const [contacts, setUserContacts] = useState<ContactUser[]>([]);
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const filterTableData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters: any = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const printTableData = () => {
        const contactsDoc = new jsPDF();
        autoTable(contactsDoc, { html: '.p-datatable-table' });
        contactsDoc.autoPrint();
        contactsDoc.output('dataurlnewwindow');
    };

    useEffect(() => {
        const authUser: AuthUser = getKeyValue('admss-client-app-user');
        if (authUser) {
            setUser(authUser);
            getContactsCategories().then((response) => {
                if (response?.contact_types.length) {
                    setCategories(response?.contact_types);
                }
            });
            getContactsByUserId(authUser.useruid).then((response) => {
                if (response?.length) {
                    setUserContacts(response);
                }
            });
        }
    }, []);
    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Contacts</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-6'>
                                <div className='contact-top-controls'>
                                    <Dropdown
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.value)}
                                        options={categories}
                                        optionLabel='name'
                                        editable
                                        className='m-r-20px'
                                        placeholder='Select Category'
                                    />
                                    <Button
                                        className='contact-top-controls__button m-r-20px'
                                        label='New contact'
                                        severity='success'
                                        type='button'
                                    />
                                    <Button
                                        className='contact-top-controls__button m-r-20px'
                                        label='Edit'
                                        severity='success'
                                        type='button'
                                    />
                                    <Button
                                        severity='success'
                                        type='button'
                                        icon='pi pi-print'
                                        onClick={printTableData}
                                    />
                                </div>
                            </div>
                            <div className='col-6 text-right'>
                                <Button
                                    className='contact-top-controls__button m-r-20px'
                                    label='Advanced search'
                                    severity='success'
                                    type='button'
                                />
                                <span className='p-input-icon-right'>
                                    <i className='pi pi-search' />
                                    <InputText
                                        value={globalFilterValue}
                                        onChange={filterTableData}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className='grid'>
                            <div className='col-12'>
                                <DataTable
                                    filters={filters}
                                    value={contacts}
                                    paginator
                                    rows={5}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field='fullName' header='Name' sortable></Column>
                                    <Column field='phone1' header='Work Phone'></Column>
                                    <Column field='phone2' header='Home Phone'></Column>
                                    <Column field='streetAddress' header='Address'></Column>
                                    <Column field='email1' header='Email'></Column>
                                    <Column field='created' header='Created'></Column>
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
