import { GeneralInventoryOptions } from "common/models/general-settings";
import { TextInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { ReactElement, useMemo } from "react";

export const NEW_ITEM = "new";
const MAX_LENGTH = 32;

interface InventoryOptionRowProps {
    item: Partial<GeneralInventoryOptions>;
    index: number;
    isFirst: boolean;
    draggedItemId?: string | null;
    editedItem: Partial<GeneralInventoryOptions> | null;
    setEditedItem: (item: Partial<GeneralInventoryOptions>) => void;
    handleSetOrder: (option: Partial<GeneralInventoryOptions>, newOrder: number) => Promise<void>;
    handleSaveOption: (option: Partial<GeneralInventoryOptions>) => void;
    handleDeleteOption: (optionuid: string) => void;
    totalOffset?: number;
}

export const HeaderColumn = (): ReactElement => {
    const template = (numberPadding: 3 | 0, namePadding?: 5 | 2) => (
        <div className='col-6 grid m-0'>
            <div
                className={`settings-inventory__number settings-inventory__number pl-${numberPadding}`}
            >
                #
            </div>
            <div className='col-1'></div>
            <div className={`settings-inventory__name justify-content-start pl-${namePadding}`}>
                Option
            </div>
        </div>
    );
    return (
        <div className='settings-inventory__header col-12 grid m-0'>
            {template(0, 2)}
            {template(3, 5)}
        </div>
    );
};

export const InventoryOptionRow = observer(
    ({
        item,
        index,
        isFirst,
        editedItem,
        setEditedItem,
        handleSaveOption,
        handleSetOrder,
        handleDeleteOption,
        draggedItemId = null,
        totalOffset = 0,
    }: InventoryOptionRowProps): ReactElement => {
        const initialValue = item.name;
        const symbolToLimit = useMemo(() => {
            if (!editedItem?.name) return MAX_LENGTH.toString();
            const limit = MAX_LENGTH - editedItem.name.length;
            return limit.toString();
        }, [editedItem?.name]);

        const editTemplate = (
            <div className='flex row-edit'>
                <TextInput
                    value={editedItem?.name || ""}
                    className='row-edit__input'
                    maxLength={MAX_LENGTH}
                    infoText={symbolToLimit}
                    height={35}
                    onChange={(e) =>
                        setEditedItem({
                            ...editedItem,
                            name: e.target.value,
                        })
                    }
                />
                <Button
                    className='p-button row-edit__button'
                    icon='icon adms-arrow-right-1'
                    onClick={(e) => {
                        e.stopPropagation();
                        if (editedItem?.name === initialValue) {
                            setEditedItem({});
                            return;
                        }
                        editedItem && handleSaveOption(editedItem);
                    }}
                />
            </div>
        );

        return (
            <div
                key={item.itemuid}
                className={`settings-inventory__row ${index < totalOffset / 2 ? "justify-content-start" : "justify-content-end settings-inventory__row--right"} grid col-12 ${draggedItemId === item.itemuid ? "dragged" : ""}`}
            >
                <div className='option-control p-0'>
                    {item.itemuid !== NEW_ITEM && (
                        <>
                            <Button
                                icon='pi pi-arrow-circle-up'
                                rounded
                                text
                                severity={isFirst ? "secondary" : "success"}
                                tooltip='To the top'
                                className='p-button-text option-control__button'
                                onClick={() => handleSetOrder(item, index - 1)}
                                disabled={isFirst || item.itemuid === NEW_ITEM}
                            />
                            <Button
                                icon='pi pi-arrow-circle-down'
                                rounded
                                text
                                severity={
                                    item.itemuid === NEW_ITEM || index === totalOffset - 1
                                        ? "secondary"
                                        : "success"
                                }
                                tooltip='To the bottom'
                                disabled={item.itemuid === NEW_ITEM || index === totalOffset - 1}
                                onClick={() => handleSetOrder(item, index + 1)}
                                className='p-button-text option-control__button'
                            />
                        </>
                    )}
                </div>
                <div className='col-8 p-0 flex align-items-center'>
                    {editedItem?.itemuid === item.itemuid ? editTemplate : item.name}
                </div>
                <div className='col-2 p-0 option-control'>
                    {item.itemuid !== NEW_ITEM && (
                        <>
                            <Button
                                tooltip='Edit option'
                                className='inventory-options__edit-button'
                                icon='icon adms-edit-item'
                                text
                                onClick={(e) => {
                                    e.stopPropagation();
                                    editedItem?.itemuid ? setEditedItem({}) : setEditedItem(item);
                                }}
                            />
                            <Button
                                tooltip='Delete option'
                                className='inventory-options__delete-button'
                                icon='icon adms-trash-can'
                                text
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item?.itemuid && handleDeleteOption(item.itemuid);
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    }
);
