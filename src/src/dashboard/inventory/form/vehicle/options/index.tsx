import { Checkbox } from "primereact/checkbox";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { OptionsListData, getInventoryOptionsList } from "http/services/inventory-service";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const VehicleOptions = observer((): ReactElement => {
    const store = useStore().inventoryStore;

    const { inventoryOptions, changeInventoryOptions } = store;
    const [options, setOptions] = useState<OptionsListData[]>([]);

    useEffect(() => {
        getInventoryOptionsList().then((response) => {
            response && setOptions(response);
        });
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
