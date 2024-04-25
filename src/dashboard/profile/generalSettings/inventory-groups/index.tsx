import { Column, ColumnEditorOptions, ColumnProps } from "primereact/column";
import "./index.css";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import {
    addUserGroupList,
    deleteUserGroupList,
    getUserGroupList,
} from "http/services/auth-user.service";
import { UserGroup } from "common/models/user";

const renderColumnsData: Pick<ColumnProps, "header" | "field">[] = [
    { field: "description", header: "Group" },
];

export const SettingsInventoryGroups = () => {
    const [inventorySettings, setInventorySettings] = useState<Partial<UserGroup>[]>([]);
    const [selectedInventory, setSelectedInventory] = useState<Partial<UserGroup>[] | null>(null);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getUserGroupList(authUser.useruid).then((list) => {
                list && setInventorySettings(list);
            });
        }
    }, []);

    const textEditor = (options: ColumnEditorOptions) => {
        return (
            <div className='flex row-edit'>
                <InputText
                    type='text'
                    value={options.value}
                    className='row-edit__input'
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        options.editorCallback!(e.target.value)
                    }
                />
                <Button
                    className='p-button row-edit__button'
                    onClick={() => {
                        const { rowData } = options;
                        const newData = [...inventorySettings];
                        newData.find((item) => item.itemuid === rowData.itemuid)!.description =
                            options.value;
                        setInventorySettings(newData);
                    }}
                >
                    Save
                </Button>
            </div>
        );
    };

    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Inventory groups</div>
            <div className='flex justify-content-end mb-4'>
                <Button
                    className='settings-form__button'
                    outlined
                    onClick={() => {
                        addUserGroupList(getKeyValue(LS_APP_USER).useruid, "New group").then(() => {
                            getUserGroupList(getKeyValue(LS_APP_USER).useruid).then((list) => {
                                list && setInventorySettings(list);
                            });
                        });
                    }}
                >
                    New Group
                </Button>
            </div>
            <div className='grid settings-inventory'>
                <div className='col-12'>
                    <DataTable
                        value={inventorySettings}
                        selectionMode={"checkbox"}
                        selection={selectedInventory!}
                        editMode='row'
                        onSelectionChange={(e) => setSelectedInventory(e.value)}
                    >
                        <Column selectionMode='multiple' headerStyle={{ width: "3rem" }}></Column>
                        {renderColumnsData.map(({ field, header }) => (
                            <Column
                                field={field}
                                bodyStyle={{ height: "30px" }}
                                header={header}
                                key={field}
                                editor={(options) => textEditor(options)}
                            />
                        ))}
                        <Column
                            headerStyle={{ width: "6rem" }}
                            header={"Actions"}
                            rowEditor
                            body={(rowData, options) => {
                                return (
                                    <div className='flex gap-3'>
                                        <Button
                                            className='p-button p-button-outlined'
                                            severity={
                                                options.rowEditor?.editing ? "secondary" : "success"
                                            }
                                            onClick={(event) => {
                                                if (options.rowEditor?.editing) {
                                                    return options.rowEditor?.onSaveClick!(event);
                                                }
                                                options.rowEditor?.onInitClick!(event);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className='p-button p-button-outlined'
                                            severity='secondary'
                                            onClick={() => {
                                                deleteUserGroupList(rowData.itemuid).then(() => {
                                                    getUserGroupList(
                                                        getKeyValue(LS_APP_USER).useruid
                                                    ).then((list) => {
                                                        list && setInventorySettings(list);
                                                    });
                                                });
                                            }}
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
