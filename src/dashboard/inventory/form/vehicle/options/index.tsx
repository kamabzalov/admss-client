import { Checkbox } from "primereact/checkbox";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { getInventoryGroupOptions, getInventoryOptions } from "http/services/inventory-service";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { InventoryOptions, OptionsListData } from "common/models/inventory";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AccordionItems } from "dashboard/inventory/common";
import { Button } from "primereact/button";

const OPTION_PATH = "/dashboard/settings?section=inventory-settings&tab=1";

export const VehicleOptions = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const generalStore = useStore().generalSettingsStore;
    const toast = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const { inventoryGroupID, inventoryOptions, changeInventoryOptions } = store;
    const [options, setOptions] = useState<OptionsListData[]>([]);
    const location = useLocation();
    const currentPath = location.pathname + location.search;

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
            const options = response as unknown as OptionsListData[];
            setOptions(options?.filter(Boolean));
        }
    };

    const handleGetInventoryOptionsList = async () => {
        if (!id) return;
        const response = await getInventoryOptions(id);
        if (response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const { options_list } = response as InventoryOptions;
            if (!options_list?.filter(Boolean).length && inventoryGroupID) {
                handleGetInventoryOptionsList();
            } else {
                setOptions(
                    options_list?.filter((option): option is OptionsListData => option != null)
                );
            }
        }
    };

    useEffect(() => {
        if (id) {
            handleGetInventoryOptionsList();
        } else {
            inventoryGroupID && handleGetInventoryOptionsGroupList();
        }
    }, [id, inventoryGroupID]);

    const handleNavigateToOptions = () => {
        store.isErasingNeeded = false;
        generalStore.prevPath = currentPath;
        navigate(OPTION_PATH);
    };

    const hasInventoryGroup = Boolean(inventoryGroupID);
    const showSelectGroupHint = !hasInventoryGroup;
    const showNoOptionsHint = !id && hasInventoryGroup && !options.length;

    return (
        <>
            <div className='vehicle-options__header'>
                <div className='entity-form-panel__title inventory-form__title uppercase heading-condensed'>
                    {AccordionItems.OPTIONS}
                </div>
                <Button
                    label='Edit options'
                    type='button'
                    className='p-button vehicle-options__button'
                    onClick={handleNavigateToOptions}
                />
            </div>
            <div
                className={`grid flex-column vehicle-options ${
                    showSelectGroupHint ? "vehicle-options--no-group" : ""
                } ${showNoOptionsHint ? "vehicle-options--empty" : ""}`}
            >
                {showSelectGroupHint && (
                    <p className='vehicle-options__hint'>
                        Select inventory group first for getting options
                    </p>
                )}
                {showNoOptionsHint && (
                    <p className='vehicle-options__hint'>Inventory group has no options</p>
                )}
                {hasInventoryGroup && (
                    <div className='vehicle-options__list'>
                        {options.map(({ name, index }) => (
                            <div
                                key={index}
                                className='vehicle-options__checkbox flex align-items-center'
                            >
                                <Checkbox
                                    inputId={name}
                                    name={name}
                                    onChange={() => changeInventoryOptions(name)}
                                    checked={inventoryOptions.includes(name)}
                                />
                                <label htmlFor={name} className='ml-2'>
                                    {name}
                                </label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
});
