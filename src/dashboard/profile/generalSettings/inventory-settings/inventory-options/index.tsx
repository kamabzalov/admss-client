import "./index.css";
import { Button } from "primereact/button";
import { ReactElement, useEffect, useState, useMemo } from "react";
import { UserGroup } from "common/models/user";
import { TOAST_LIFETIME } from "common/settings";
import { useToast } from "dashboard/common/toast";
import { useStore } from "store/hooks";
import { getInventoryGroupOptions } from "http/services/inventory-service";
import { ComboBox } from "dashboard/common/form/dropdown";
import { observer } from "mobx-react-lite";
import { GeneralInventoryOptions } from "common/models/general-settings";
import { NEW_ITEM, InventoryOptionRow, HeaderColumn } from "./template";
import { Layout, Responsive, ResponsiveProps, WidthProvider } from "react-grid-layout";
import {
    deleteInventoryGroupOption,
    restoreInventoryGroupDefaults,
    setInventoryGroupOption,
} from "http/services/settings.service";
import { Loader } from "dashboard/common/loader";
import { Status } from "common/models/base-response";

const ResponsiveReactGridLayout = WidthProvider<ResponsiveProps>(Responsive);

export const SettingsInventoryOptions = observer((): ReactElement => {
    const toast = useToast();
    const store = useStore().generalSettingsStore;
    const { inventoryGroupID, inventoryGroups } = store;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [inventoryOptions, setInventoryOptions] = useState<Partial<GeneralInventoryOptions>[]>(
        []
    );
    const [editedItem, setEditedItem] = useState<Partial<GeneralInventoryOptions> | null>(null);
    const [layoutKey, setLayoutKey] = useState<boolean>(false);

    const handleGetInventoryOptionsGroupList = async () => {
        const response = await getInventoryGroupOptions(inventoryGroupID);
        if (response?.error && !Array.isArray(response)) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const options = response as unknown as UserGroup[];
            setInventoryOptions(options?.filter(Boolean));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        inventoryGroupID && handleGetInventoryOptionsGroupList();
    }, [inventoryGroupID]);

    const handleSaveOption = async (option: Partial<GeneralInventoryOptions>) => {
        if (!option.name) {
            return toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Option name is required",
                life: TOAST_LIFETIME,
            });
        }

        if (!option.itemuid) {
            return toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "Option UID is required",
                life: TOAST_LIFETIME,
            });
        }

        const isNew = option.itemuid === NEW_ITEM;
        const itemuid = isNew ? "0" : option.itemuid;
        const response = await setInventoryGroupOption(inventoryGroupID, {
            ...option,
            itemuid,
        });
        if (response?.error || response?.status === Status.ERROR) {
            return toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error,
                life: TOAST_LIFETIME,
            });
        }

        await handleGetInventoryOptionsGroupList();
        setEditedItem({});

        toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: `Option ${isNew ? "created" : "updated"} successfully`,
            life: TOAST_LIFETIME,
        });
    };

    const handleDeleteOption = async (optionuid: string) => {
        setIsLoading(true);
        const response = await deleteInventoryGroupOption(optionuid);
        if (response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error,
                life: TOAST_LIFETIME,
            });
        } else {
            await handleGetInventoryOptionsGroupList();
        }
        setIsLoading(false);
    };

    const handleChangeOrder = async (
        option: Partial<GeneralInventoryOptions>,
        newOrder?: number
    ) => {
        if (option.itemuid === editedItem?.itemuid) {
            return;
        }

        const currentIndex = inventoryOptions.findIndex((item) => item.itemuid === option.itemuid);
        const updatedOptions = inventoryOptions.map((item, index) => {
            if (item.itemuid === option.itemuid) {
                return {
                    ...item,
                    order: newOrder !== undefined ? newOrder : item.order,
                };
            }

            if (
                newOrder !== undefined &&
                newOrder < currentIndex &&
                index >= newOrder &&
                index < currentIndex
            ) {
                return {
                    ...item,
                    order: (item.order ?? 0) + 1,
                };
            }

            if (
                newOrder !== undefined &&
                newOrder > currentIndex &&
                index > currentIndex &&
                index <= newOrder
            ) {
                return {
                    ...item,
                    order: (item.order ?? 0) - 1,
                };
            }

            return item;
        });

        const response = await setInventoryGroupOption(inventoryGroupID, updatedOptions);
        if (response?.error || response?.status === Status.ERROR) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error,
                life: TOAST_LIFETIME,
            });
            return handleGetInventoryOptionsGroupList();
        }

        await handleGetInventoryOptionsGroupList();
    };

    const handleRestoreDefaults = async () => {
        setIsLoading(true);
        const response = await restoreInventoryGroupDefaults(inventoryGroupID);
        if (response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response?.error,
                life: TOAST_LIFETIME,
            });
        } else {
            await handleGetInventoryOptionsGroupList();
            toast.current?.show({
                severity: "success",
                summary: "Success",
                detail: "Inventory group defaults restored successfully",
                life: TOAST_LIFETIME,
            });
        }
        setIsLoading(false);
    };

    const handleDragItem = async (layout: Layout[], oldItem: Layout, newItem: Layout) => {
        if (
            (oldItem.x === newItem.x && oldItem.y === newItem.y) ||
            oldItem.i === editedItem?.itemuid
        ) {
            return;
        }

        const sortedLayout = [...layout].sort((a, b) => {
            if (a.x === b.x) return a.y - b.y;
            return a.x - b.x;
        });

        const itemsPerColumn = Math.ceil(inventoryOptions.length / 2);

        if (oldItem.x === 0 && newItem.x === 1) {
            const firstSecondColumnItem = sortedLayout.find((item) => item.x === 1 && item.y === 0);

            if (firstSecondColumnItem) {
                firstSecondColumnItem.x = 0;
                firstSecondColumnItem.y = itemsPerColumn - 1;

                sortedLayout.forEach((item) => {
                    if (item.x === 1 && item.y > 0) {
                        item.y -= 1;
                    }
                });
            }
        }

        const updatedOptions = sortedLayout
            .map((layoutItem) => {
                const originalItem = inventoryOptions.find((opt) => opt.itemuid === layoutItem.i);
                if (!originalItem) return null;

                const isFirstColumn = layoutItem.x === 0;
                const baseOrder = isFirstColumn ? 0 : itemsPerColumn;
                const order = baseOrder + layoutItem.y;

                return {
                    ...originalItem,
                    order,
                };
            })
            .filter(Boolean) as Partial<GeneralInventoryOptions>[];

        try {
            const response = await setInventoryGroupOption(inventoryGroupID, updatedOptions);
            if (response?.error || response?.status === Status.ERROR) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: response?.error,
                    life: TOAST_LIFETIME,
                });
                setLayoutKey(!layoutKey);
                return handleGetInventoryOptionsGroupList();
            }

            await handleGetInventoryOptionsGroupList();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to update options order";
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: errorMessage,
                life: TOAST_LIFETIME,
            });
            setLayoutKey(!layoutKey);
        } finally {
            setIsLoading(false);
        }
    };

    const layouts = useMemo(() => {
        const itemsPerColumn = Math.ceil(inventoryOptions.length / 2);
        return {
            lg: inventoryOptions.map((item, index) => ({
                i: item.itemuid || `${index}`,
                x: index < itemsPerColumn ? 0 : 1,
                y: index % itemsPerColumn,
                w: 1,
                h: 1,
            })),
        };
    }, [inventoryOptions]);

    const handleNewOption = () => {
        if (inventoryOptions.find((item) => item.itemuid === NEW_ITEM)) {
            setEditedItem({});
            setInventoryOptions(inventoryOptions.filter((item) => item.itemuid !== NEW_ITEM));
            return;
        }
        setEditedItem({ name: "", itemuid: NEW_ITEM });
        setInventoryOptions([...inventoryOptions, { name: "", itemuid: NEW_ITEM }]);
        setTimeout(() => {
            const contentRef = document.querySelector(
                ".settings-inventory__tabs .general-inventory-option"
            ) as HTMLDivElement;
            if (contentRef) {
                contentRef.scrollTo({ top: contentRef.scrollHeight, behavior: "smooth" });
            }
        }, 100);
    };

    return isLoading ? (
        <div className='form-loader'>
            <Loader />
        </div>
    ) : (
        <>
            <div className='flex justify-content-end align-items-center mb-4'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <ComboBox
                            optionLabel='description'
                            optionValue='itemuid'
                            filter
                            options={inventoryGroups}
                            value={inventoryGroupID}
                            onChange={(e) => {
                                setEditedItem({});
                                store.inventoryGroupID = e.value;
                            }}
                            placeholder='Group class'
                            className='w-full vehicle-general__dropdown'
                            label='Options by inventory group'
                        />
                    </span>
                </div>
                <Button
                    className='ml-auto settings-form__button'
                    severity='warning'
                    outlined
                    onClick={handleRestoreDefaults}
                >
                    Reset to Default
                </Button>
                <Button className='ml-4 settings-form__button' outlined onClick={handleNewOption}>
                    New Option
                </Button>
            </div>
            <div className='grid general-inventory-option p-2'>
                <HeaderColumn />

                {!inventoryOptions.length ? (
                    <div className='col-12'>No options available</div>
                ) : (
                    <div className='col-12 grid p-0 inventory-options-container'>
                        <div className='inventory-numbers inventory-numbers--left'>
                            {inventoryOptions
                                .slice(0, Math.ceil(inventoryOptions.length / 2))
                                .map((_, index) => (
                                    <div
                                        key={index}
                                        className='inventory-option-number col-1 flex align-items-center'
                                    >
                                        <span className='option-control__number'>{index + 1}</span>
                                    </div>
                                ))}
                        </div>
                        <div className='inventory-content'>
                            <ResponsiveReactGridLayout
                                key={layoutKey.toString()}
                                className='layout relative'
                                layouts={layouts}
                                cols={{ lg: 2, md: 2, sm: 2, xs: 2, xxs: 1 }}
                                rowHeight={45}
                                width={600}
                                margin={[10, 1]}
                                isDraggable={!editedItem || !Object.keys(editedItem).length}
                                isDroppable={!editedItem || Object.keys(editedItem).length === 0}
                                onDragStop={handleDragItem}
                                draggableCancel='.option-control__button, .inventory-options__edit-button, .inventory-options__delete-button, .row-edit'
                            >
                                {inventoryOptions.map((item, index) => (
                                    <div
                                        key={item.itemuid || `${index}`}
                                        className={`cursor-pointer ${
                                            index < Math.ceil(inventoryOptions.length / 2)
                                                ? "mr-2"
                                                : "pl-3"
                                        }`}
                                    >
                                        <InventoryOptionRow
                                            item={item}
                                            index={index}
                                            isFirst={index === 0}
                                            editedItem={editedItem}
                                            setEditedItem={setEditedItem}
                                            handleSaveOption={handleSaveOption}
                                            handleSetOrder={handleChangeOrder}
                                            handleDeleteOption={handleDeleteOption}
                                            totalOffset={inventoryOptions.length}
                                        />
                                    </div>
                                ))}
                            </ResponsiveReactGridLayout>
                        </div>
                        <div className='inventory-numbers inventory-numbers--right'>
                            {inventoryOptions
                                .slice(Math.ceil(inventoryOptions.length / 2))
                                .map((_, index) => (
                                    <div
                                        key={index}
                                        className='inventory-option-number col-1 flex align-items-center'
                                    >
                                        <span className='option-control__number'>
                                            {index + Math.ceil(inventoryOptions.length / 2) + 1}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
});
