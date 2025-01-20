import { Checkbox } from "primereact/checkbox";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { getInventoryOptions } from "http/services/inventory-service";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { InventoryOptions, OptionsListData } from "common/models/inventory";

export const VehicleOptions = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const toast = useToast();

    const { inventory, inventoryOptions, changeInventoryOptions } = store;
    const [options, setOptions] = useState<OptionsListData[]>([]);

    const handleGetInventoryOptionsList = async () => {
        const response = await getInventoryOptions(inventory.itemuid);
        if (response?.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: response.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const { options_list } = response as InventoryOptions;
            setOptions(options_list);
        }
    };

    useEffect(() => {
        handleGetInventoryOptionsList();
    }, []);

    return (
        <>
            <div className='grid flex-column vehicle-options'>
                {options.map(({ name, index }) => (
                    <div key={index} className='vehicle-options__checkbox flex align-items-center'>
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
        </>
    );
});
