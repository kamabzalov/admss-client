import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement } from "react";

import "./index.css";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Column, ColumnProps } from "primereact/column";
import { DataTable } from "primereact/datatable";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "date", header: "Date" },
    { field: "note_taker", header: "Note Taker" },
    { field: "Insurance Company", header: "Insurance Company" },
    { field: "Insurance Agent", header: "Insurance Agent" },
    { field: "policy", header: "Policy#" },
];

export const AccountInsurance = (): ReactElement => (
    <div className='account-insurance'>
        <div className='grid'>
            <div className='col-12'>
                <TabView className='account-insurance__tabs'>
                    <TabPanel header='Insurance'>
                        <div className='insurance-info'>
                            <div className='insurance-info__item'>
                                <div className='insurance-field'>
                                    <label>Insurance Company:</label>
                                    <span>AutoMotive Inc.</span>
                                </div>
                                <div className='insurance-field'>
                                    <label>Insurance Agent:</label>
                                    <span>Christopher Nolan</span>
                                </div>
                                <div className='insurance-field'>
                                    <label>Policy#:</label>
                                    <span>RO48757832-LN</span>
                                </div>
                                <div className='insurance-field'>
                                    <Checkbox
                                        inputId='account-insurance-policy'
                                        name='account-insurance-policy'
                                        checked={false}
                                    />
                                    <label htmlFor='account-insurance-policy' className='ml-2'>
                                        Insurance Policy Received
                                    </label>
                                </div>
                                <div className='insurance-field'>
                                    <label>Expiration Date:</label>
                                    <span>07/17/2024</span>
                                </div>
                            </div>
                            <div className='insurance-info__item'>
                                <div className='insurance-field'>
                                    <Checkbox
                                        inputId='account-insurance-title-received'
                                        name='account-insurance-title-received'
                                        checked={false}
                                    />
                                    <label
                                        htmlFor='account-insurance-title-received'
                                        className='ml-2'
                                    >
                                        Title Received
                                    </label>
                                </div>
                                <span className='p-float-label'>
                                    <InputText />
                                    <label className='float-label'>Title#</label>
                                </span>
                            </div>
                            <div className='insurance-info__footer'>
                                <Button className='insurance-info__button'>Save</Button>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel header='Insurance history'>
                        <DataTable
                            className='mt-6 account-insurance__table'
                            value={[]}
                            emptyMessage='No history added yet.'
                            reorderableColumns
                            resizableColumns
                            scrollable
                        >
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
                    </TabPanel>
                </TabView>
            </div>
        </div>
    </div>
);
