import { GeneralInventoryOptions } from "common/models/general-settings";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ReactElement } from "react";

export const NEW_ITEM = "new";

interface InventoryOptionRowProps {
    item: Partial<GeneralInventoryOptions>;
    index: number;
    isFirst: boolean;
    editedItem: Partial<GeneralInventoryOptions>;
    setEditedItem: (item: Partial<GeneralInventoryOptions>) => void;
    handleSaveOption: () => void;
    handleDeleteOption: (optionuid: string) => void;
    totalOffset?: number;
}

export const HeaderColumn = (): ReactElement => (
    <div className='settings-inventory__header grid'>
        <div className='col-2 option-control' />
        <div className='col-1 flex align-items-center'>#</div>
        <div className='col-7 flex align-items-center'>Option</div>
        <div className='col-2 option-control' />
    </div>
);

export const InventoryOptionRow = ({
    item,
    index,
    isFirst,
    editedItem,
    setEditedItem,
    handleSaveOption,
    handleDeleteOption,
    totalOffset = 0,
}: InventoryOptionRowProps): ReactElement => (
    <div key={item.itemuid} className='settings-inventory__row grid col-12'>
        <div className='col-2 option-control'>
            <Button
                icon='pi pi-arrow-circle-up'
                rounded
                text
                severity='success'
                tooltip='Move up'
                className='p-button-text option-control__button'
                disabled={isFirst || item.itemuid === NEW_ITEM}
            />
            <Button
                icon='pi pi-arrow-circle-down'
                rounded
                text
                severity='success'
                tooltip='Move down'
                className='p-button-text option-control__button'
            />
        </div>
        <div className='col-1 flex align-items-center'>
            <span className='option-control__number'>
                {(item?.order || index + totalOffset) + 1}
            </span>
        </div>
        <div className='col-7 flex align-items-center'>
            {editedItem.itemuid === item.itemuid ? (
                <div className='flex row-edit'>
                    <InputText
                        type='text'
                        value={editedItem.name}
                        className='row-edit__input'
                        onChange={(e) =>
                            setEditedItem({
                                ...editedItem,
                                name: e.target.value,
                            })
                        }
                    />
                    <Button className='p-button row-edit__button' onClick={handleSaveOption}>
                        Save
                    </Button>
                </div>
            ) : (
                item.name
            )}
        </div>
        <div className='col-2 option-control'>
            <Button
                tooltip='Edit option'
                className='inventory-options__edit-button'
                icon='icon adms-edit-item'
                text
                onClick={() => (editedItem.itemuid ? setEditedItem({}) : setEditedItem(item))}
            />
            <Button
                tooltip='Delete option'
                className='inventory-options__delete-button'
                icon='icon adms-trash-can'
                text
                onClick={() => item?.itemuid && handleDeleteOption(item.itemuid)}
            />
        </div>
    </div>
);
