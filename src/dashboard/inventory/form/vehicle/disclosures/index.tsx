import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { ReactElement } from "react";
import "./index.css";
import { Checkbox } from "primereact/checkbox";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { InventoryExtData } from "common/models/inventory";
import { STATES_LIST } from "common/constants/states";

export const VehicleDisclosures = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        inventoryExtData: {
            dam25,
            dam25Parts,
            damTheftParts,
            damTheft,
            damFlood,
            damODOMInExcess,
            damODOMNotActual,
            damReconstructed,
            damSalvage,
            damSalvageState,
        },
        changeInventoryExtData,
    } = store;

    const handleChange = (key: keyof InventoryExtData, value: number) => {
        changeInventoryExtData({ key, value: !!value ? 0 : 1 });
    };

    return (
        <div className='grid vehicle-disclosures row-gap-2'>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        className='mt-1'
                        inputId='disclosures-excess'
                        onChange={() => handleChange("damODOMInExcess", damODOMInExcess)}
                        checked={!!damODOMInExcess}
                    />
                    <label htmlFor='disclosures-excess' className='ml-2'>
                        Odometer reflects the milage in EXCESS of its limits
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        className='mt-1'
                        inputId='disclosures-discrepancy'
                        onChange={() => handleChange("damODOMNotActual", damODOMNotActual)}
                        checked={!!damODOMNotActual}
                    />
                    <label htmlFor='disclosures-discrepancy' className='ml-2'>
                        Odometer is NOT the actual mileage - DISCREPANCY
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-salvage'
                        className='mt-1'
                        name='disclosures-salvage'
                        onChange={() => handleChange("damSalvage", damSalvage)}
                        checked={!!damSalvage}
                    />
                    <label htmlFor='disclosures-salvage' className='ml-2'>
                        Vehicle is a Salvage Vehicle
                    </label>
                </div>
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        optionLabel='name'
                        optionValue='id'
                        value={damSalvageState}
                        filter
                        onChange={({ value }) =>
                            changeInventoryExtData({ key: "damSalvageState", value })
                        }
                        options={STATES_LIST}
                        className='w-full vehicle-disclosures__dropdown'
                    />
                    <label className='float-label'>State</label>
                </span>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-flood'
                        className='mt-1'
                        name='disclosures-flood'
                        onChange={() => handleChange("damFlood", damFlood)}
                        checked={!!damFlood}
                    />
                    <label htmlFor='disclosures-flood' className='ml-2'>
                        Vehicle is a Flood Vehicle
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-damage'
                        className='mt-1'
                        name='disclosures-damage'
                        onChange={() => handleChange("dam25", dam25)}
                        checked={!!dam25}
                    />
                    <label htmlFor='disclosures-damage' className='ml-2'>
                        Vehicle suffered damage of at least 25%
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-recovered'
                        className='mt-1'
                        name='disclosures-recovered'
                        onChange={() => handleChange("damTheft", damTheft)}
                        checked={!!damTheft}
                    />
                    <label htmlFor='disclosures-recovered' className='ml-2'>
                        Vehicle is a Recovered Theft Vehicle
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='vehicle-disclosures__checkbox flex'>
                    <Checkbox
                        inputId='disclosures-reconstructed'
                        className='mt-1'
                        name='disclosures-reconstructed'
                        onChange={() => handleChange("damReconstructed", damReconstructed)}
                        checked={!!damReconstructed}
                    />
                    <label htmlFor='disclosures-reconstructed' className='ml-2'>
                        Vehicle has been Reconstructed
                    </label>
                </div>
            </div>

            <div className='col-6'>
                <span className='p-float-label'>
                    <InputTextarea
                        className='w-full vehicle-disclosures__text-area'
                        value={dam25Parts}
                        onChange={({ target: { value } }) =>
                            changeInventoryExtData({ key: "dam25Parts", value })
                        }
                    />
                    <label className='float-label'>Parts Damaged</label>
                </span>
            </div>
            <div className='col-6'>
                <span className='p-float-label'>
                    <InputTextarea
                        className='w-full vehicle-disclosures__text-area'
                        value={damTheftParts}
                        onChange={({ target: { value } }) =>
                            changeInventoryExtData({ key: "damTheftParts", value })
                        }
                    />
                    <label className='float-label'>Theft Parts Damaged</label>
                </span>
            </div>
        </div>
    );
});
