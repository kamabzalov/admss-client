import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement, useEffect, useState } from "react";

import "./index.css";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";
import { listAccountNotes } from "http/services/accounts.service";
import { useParams } from "react-router-dom";
import { AccountNote } from "common/models/accounts";

interface TableColumnProps extends ColumnProps {
    field: keyof AccountNote;
}

const renderColumnsData: Pick<TableColumnProps, "header" | "field">[] = [
    { field: "Date", header: "Date" },
    { field: "NoteBy", header: "Note Taker" },
    { field: "ContactMethod", header: "Contact Type" },
];

export const AccountNotes = (): ReactElement => {
    const { id } = useParams();
    const [notesList, setNotesList] = useState<AccountNote[]>([]);

    useEffect(() => {
        if (id) {
            listAccountNotes(id).then((res) => {
                if (Array.isArray(res) && res.length) setNotesList(res);
            });
        }
    }, [id]);

    return (
        <div className='account-notes account-card'>
            <h3 className='account-notes__title account-title'>Notes</h3>
            <div className='grid account__body'>
                <div className='col-12 account__control'>
                    <div className='account-note'>
                        <span className='p-float-label'>
                            <InputTextarea id='account-memo' className='account-note__input' />
                            <label htmlFor='account-memo'>Account Memo</label>
                        </span>
                        <Button
                            severity='secondary'
                            className='account-note__button'
                            label='Save'
                        />
                    </div>
                    <div className='account-note'>
                        <span className='p-float-label'>
                            <InputTextarea id='account-payment' className='account-note__input' />
                            <label htmlFor='account-payment'>Payment Alert</label>
                        </span>
                        <Button
                            severity='secondary'
                            className='account-note__button'
                            label='Save'
                        />
                    </div>
                </div>
                <div className='col-12 mt-5 flex justify-content-end'>
                    <Button className='account-notes__button'>Add Note</Button>
                </div>
                <div className='col-12 account__table'>
                    <DataTable
                        showGridlines
                        value={notesList}
                        emptyMessage='No notes added yet.'
                        reorderableColumns
                        resizableColumns
                        scrollable
                    >
                        <Column
                            bodyStyle={{ textAlign: "center" }}
                            reorderable={false}
                            resizeable={false}
                            body={(options, { rowIndex }) => {
                                return (
                                    <div className={`flex gap-3 align-items-center `}>
                                        <Button
                                            className='text account-notes__table-button'
                                            icon='icon adms-edit-item'
                                        />
                                        <Button
                                            className='text account-notes__table-button'
                                            icon='pi pi-angle-down'
                                        />
                                    </div>
                                );
                            }}
                            pt={{
                                root: {
                                    style: {
                                        width: "100px",
                                    },
                                },
                            }}
                        />
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                header={header}
                                alignHeader={"left"}
                                key={field}
                                headerClassName='cursor-move'
                                className='max-w-16rem overflow-hidden text-overflow-ellipsis'
                            />
                        ))}
                    </DataTable>
                </div>
                {!!notesList.length && (
                    <div className='col-12 flex gap-3'>
                        <Button className='account-notes__button'>Print</Button>
                        <Button className='account-notes__button'>Download</Button>
                    </div>
                )}
            </div>
        </div>
    );
};
