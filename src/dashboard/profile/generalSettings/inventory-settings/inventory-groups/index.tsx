import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useState, useMemo } from "react";
import { InputText } from "primereact/inputtext";
import { addUserGroupList, deleteUserGroupList } from "http/services/auth-user.service";
import { UserGroup } from "common/models/user";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { BaseResponseError, Status } from "common/models/base-response";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { Layout, Responsive, ResponsiveProps, WidthProvider } from "react-grid-layout";
import { useToastMessage } from "common/hooks";
import { MOVE_DIRECTION, NEW_ITEM } from "common/constants/report-options";

const ResponsiveReactGridLayout = WidthProvider<ResponsiveProps>(Responsive);

export const SettingsInventoryGroups = observer((): ReactElement => {
    const store = useStore().generalSettingsStore;
    const { showError, showSuccess } = useToastMessage();
    const userStore = useStore().userStore;
    const { inventoryGroups, getUserGroupList, changeInventoryGroups } = store;
    const { authUser } = userStore;
    const [editedItem, setEditedItem] = useState<Partial<UserGroup>>({});
    const [layoutKey, setLayoutKey] = useState<boolean>(false);
    const [isMoving, setIsMoving] = useState<boolean>(false);

    const layouts = useMemo(() => {
        return {
            lg: inventoryGroups.map((item, index) => ({
                i: item.itemuid || `${index}`,
                x: 0,
                y: index,
                w: 1,
                h: 1,
            })),
        };
    }, [inventoryGroups]);

    const handleMoveItem = async (currentItem: UserGroup, direction: MOVE_DIRECTION) => {
        if (currentItem && !isMoving) {
            setIsMoving(true);
            try {
                const order =
                    direction === MOVE_DIRECTION.UP ? --currentItem.order : ++currentItem.order;
                await addUserGroupList(authUser!.useruid, {
                    ...currentItem,
                    order,
                });
                await getUserGroupList();
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to move group";
                showError(errorMessage);
            } finally {
                setIsMoving(false);
            }
        }
    };

    const handleSetGroupDefault = async (item: UserGroup) => {
        if (item) {
            await addUserGroupList(authUser!.useruid, {
                ...item,
                isdefault: !!item.isdefault ? 0 : 1,
            });
            getUserGroupList();
        }
    };

    const handleSaveGroup = async () => {
        const response = await addUserGroupList(authUser!.useruid, {
            description: editedItem.description,
            itemuid: editedItem.itemuid === NEW_ITEM ? undefined : editedItem.itemuid,
        });
        if (response?.status === Status.ERROR) {
            const { error, status } = response as BaseResponseError;
            status === Status.ERROR ? showError(error) : showSuccess(error);
        }
        getUserGroupList().then(() => {
            setEditedItem({});
        });
    };

    const handleToggleGroupVisible = async (item: UserGroup) => {
        await addUserGroupList(authUser!.useruid, {
            enabled: !item.enabled ? 1 : 0,
            itemuid: item.itemuid,
            description: item.description,
        });
        getUserGroupList();
    };

    const handleDeleteGroup = (item: UserGroup) => {
        item.itemuid &&
            deleteUserGroupList(item.itemuid).then(() => {
                getUserGroupList();
            });
    };

    const handleCheckAllGroups = ({ checked }: CheckboxChangeEvent) => {
        inventoryGroups.forEach((item, index) => {
            if (!index) return;
            addUserGroupList(authUser!.useruid, {
                enabled: checked ? 1 : 0,
                itemuid: item.itemuid,
                description: item.description,
            }).then(() => {
                getUserGroupList();
            });
        });
    };

    const handleDragItem = async (layout: Layout[], oldItem: Layout, newItem: Layout) => {
        if (
            (oldItem.x === newItem.x && oldItem.y === newItem.y) ||
            oldItem.i === editedItem?.itemuid ||
            isMoving
        ) {
            return;
        }

        setIsMoving(true);
        const sortedLayout = [...layout].sort((a, b) => a.y - b.y);

        const updatedGroups = sortedLayout
            .map((layoutItem, index) => {
                const originalItem = inventoryGroups.find(
                    (group) => group.itemuid === layoutItem.i
                );
                if (!originalItem) return null;

                return {
                    ...originalItem,
                    order: index + 1,
                };
            })
            .filter(Boolean) as UserGroup[];

        try {
            for (const group of updatedGroups) {
                await addUserGroupList(authUser!.useruid, {
                    ...group,
                    order: group.order,
                });
            }
            await getUserGroupList();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to update group order";
            showError(errorMessage);
            setLayoutKey(!layoutKey);
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <>
            <div className='flex justify-content-end mb-4'>
                <Button
                    className='settings-form__button'
                    outlined
                    onClick={() => {
                        setEditedItem({
                            description: "",
                            itemuid: NEW_ITEM,
                        });
                        changeInventoryGroups([
                            ...inventoryGroups,
                            {
                                description: "",
                                itemuid: NEW_ITEM,
                            } as UserGroup,
                        ]);
                    }}
                >
                    New Group
                </Button>
            </div>
            <div className='grid inventory-group p-2'>
                <div className='col-12'>
                    <div className='inventory-group__header'>
                        <div className='inventory-group__navigation'></div>
                        <div className='inventory-group__checkbox'>
                            <Checkbox
                                checked={inventoryGroups.every((item) => item.enabled)}
                                onChange={handleCheckAllGroups}
                            />
                        </div>
                        <div className='inventory-group__name'>Group</div>
                        <div className='inventory-group__actions'>Actions</div>
                    </div>
                    <ResponsiveReactGridLayout
                        key={layoutKey.toString()}
                        className='layout relative inventory-group__body'
                        layouts={layouts}
                        cols={{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }}
                        rowHeight={61}
                        width={600}
                        margin={[0, 0]}
                        compactType='vertical'
                        isDraggable={(!editedItem || !Object.keys(editedItem).length) && !isMoving}
                        isDroppable={!editedItem || Object.keys(editedItem).length === 0}
                        onDragStop={handleDragItem}
                        draggableCancel='.p-button, .row-edit'
                    >
                        {inventoryGroups.map((item, index) => (
                            <div
                                key={item.itemuid}
                                className='inventory-group__row grid col-12 cursor-pointer'
                            >
                                <div className='inventory-group__navigation'>
                                    <Button
                                        icon='pi pi-arrow-circle-up'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move up'
                                        className='p-button-text inventory-group__navigation__button'
                                        onClick={() =>
                                            handleMoveItem(item as UserGroup, MOVE_DIRECTION.UP)
                                        }
                                        disabled={
                                            index === 0 || item.itemuid === NEW_ITEM || isMoving
                                        }
                                    />
                                    <Button
                                        icon='pi pi-arrow-circle-down'
                                        rounded
                                        text
                                        severity='success'
                                        tooltip='Move down'
                                        className='p-button-text inventory-group__navigation__button'
                                        onClick={() =>
                                            handleMoveItem(item as UserGroup, MOVE_DIRECTION.DOWN)
                                        }
                                        disabled={
                                            index === inventoryGroups.length - 1 ||
                                            item.itemuid === NEW_ITEM ||
                                            isMoving
                                        }
                                    />
                                </div>
                                <div className='inventory-group__checkbox'>
                                    <Checkbox
                                        checked={!!item.enabled}
                                        tooltip='Select visible inventory groups'
                                        onClick={() => handleToggleGroupVisible(item as UserGroup)}
                                    />
                                </div>
                                <div className='inventory-group__name'>
                                    {editedItem.itemuid === item.itemuid ? (
                                        <div className='flex row-edit'>
                                            <InputText
                                                type='text'
                                                value={editedItem.description}
                                                className='row-edit__input'
                                                onChange={(e) => {
                                                    setEditedItem({
                                                        ...editedItem,
                                                        description: e.target.value,
                                                    });
                                                }}
                                            />
                                            <Button
                                                className='p-button row-edit__button'
                                                onClick={handleSaveGroup}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    ) : (
                                        item.description
                                    )}
                                </div>
                                <div className='inventory-group__actions group-actions'>
                                    <Button
                                        className='group-actions__favorite'
                                        icon={`pi pi-star${!!item.isdefault ? "-fill" : ""}`}
                                        tooltip='Make default'
                                        outlined
                                        disabled={!item.enabled}
                                        severity={!item.isdefault ? "secondary" : "success"}
                                        onClick={() => handleSetGroupDefault(item as UserGroup)}
                                    />
                                    <Button
                                        className='group-actions__edit'
                                        outlined
                                        onClick={() => {
                                            editedItem.itemuid
                                                ? setEditedItem({})
                                                : setEditedItem(item);
                                        }}
                                        disabled={!item.useruid}
                                        severity={!item.useruid ? "secondary" : "success"}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        className='group-actions__delete'
                                        outlined
                                        disabled={!!item.isdefault || !item.useruid}
                                        severity={
                                            !!item.isdefault || !item.useruid
                                                ? "secondary"
                                                : "danger"
                                        }
                                        onClick={() => handleDeleteGroup(item as UserGroup)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </ResponsiveReactGridLayout>
                </div>
            </div>
        </>
    );
});
