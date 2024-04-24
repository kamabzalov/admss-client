import { Column, ColumnProps } from "primereact/column";
import "./index.css";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "group", header: "Group" },
];

interface SettingsInventoryData {
    id: number;
    group: string;
}
const inventoryData: SettingsInventoryData[] = [
    { id: 1, group: "Cars" },
    { id: 2, group: "The Internet" },
    { id: 3, group: "Local advertisement" },
    { id: 4, group: "Direct mail" },
];

export const SettingsInventoryGroups = () => {
    const [selectedInventory, setSelectedInventory] = useState<SettingsInventoryData[] | null>(
        null
    );

    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Inventory groups</div>
            <div className='flex justify-content-end mb-4'>
                <Button className='settings-form__button' outlined>
                    New Group
                </Button>
            </div>
            <div className='grid settings-inventory'>
                <div className='col-12'>
                    <DataTable
                        value={inventoryData}
                        selectionMode={"multiple"}
                        selection={selectedInventory!}
                        onSelectionChange={(e) => setSelectedInventory(e.value)}
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: "3rem" }}></Column>
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                bodyStyle={{ height: "30px" }}
                                header={header}
                                key={field}
                            />
                        ))}
                        <Column
                            headerStyle={{ width: "6rem" }}
                            header={"Actions"}
                            body={(rowData) => {
                                return (
                                    <div className='flex gap-3'>
                                        <Button
                                            className='p-button p-button-outlined'
                                            severity='secondary'
                                            onClick={() => {}}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className='p-button p-button-outlined'
                                            severity='secondary'
                                            onClick={() => {}}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                );
                            }}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};
