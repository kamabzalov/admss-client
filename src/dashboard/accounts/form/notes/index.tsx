import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";

import "./index.css";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column, ColumnProps } from "primereact/column";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "date", header: "Date" },
    { field: "note_taker", header: "Note Taker" },
    { field: "type", header: "Contact Type" },
];

export const AccountNotes = (): ReactElement => {
    return (
        <div className='account-notes'>
            <h3 className='account-notes__title account-title'>Notes</h3>
            <div className='grid'>
                <div className='col-6'>
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
                </div>
                <div className='col-6'>
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
                <div className='col-12 flex justify-content-end'>
                    <Button className='account-notes__button'>Add Note</Button>
                </div>
                <div className='col-12'>
                    <DataTable
                        className='mt-6 account-management__table'
                        value={[]}
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
                                        <Button className='text' icon='icon adms-edit-item' />
                                        <Button className='text' icon='pi pi-angle-down' />
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
                <div className='col-12 flex gap-3'>
                    <Button className='account-notes__button'>Print</Button>
                    <Button className='account-notes__button'>Download</Button>
                </div>
            </div>
        </div>
    );
};
