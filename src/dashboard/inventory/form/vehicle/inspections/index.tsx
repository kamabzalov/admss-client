import { ReactElement } from "react";
import { InputText } from "primereact/inputtext";
import { BorderedCheckbox, DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import { InventoryExtData } from "common/models/inventory";

export const VehicleInspections = observer((): ReactElement => {
    const store = useStore().inventoryStore;

    const {
        inventoryExtData: { inspNumber, inspDate, inspEmissions, inspSafety, inspStickerExp },
        changeInventoryExtData,
    } = store;

    const handleChange = (key: keyof InventoryExtData, value: number) => {
        changeInventoryExtData({ key, value: !!value ? 0 : 1 });
    };

    return (
        <div className='grid vehicle-inspections row-gap-2'>
            <div className='col-6'>
                <InputText
                    value={inspNumber}
                    onChange={({ target: { value } }) =>
                        changeInventoryExtData({ key: "inspNumber", value })
                    }
                    placeholder='Inspection Number'
                    className='w-full vehicle-inspections__dropdown'
                />
            </div>

            <div className='col-3'>
                <DateInput
                    value={new Date(inspDate)}
                    onChange={({ value }) => {
                        if (value instanceof Date) {
                            changeInventoryExtData({
                                key: "inspDate",
                                value: value.getTime(),
                            });
                        }
                    }}
                    name='Date'
                />
            </div>
            <div className='col-3'>
                <BorderedCheckbox
                    name='Emissions Check'
                    checked={!!inspEmissions}
                    onChange={() => handleChange("inspEmissions", inspEmissions)}
                />
            </div>

            <div className='col-3'>
                <BorderedCheckbox
                    name='Safety Check'
                    checked={!!inspSafety}
                    onChange={() => handleChange("inspSafety", inspSafety)}
                />
            </div>
            <div className='col-3'>
                <DateInput
                    value={new Date(inspStickerExp)}
                    onChange={({ value }) => {
                        if (value instanceof Date) {
                            changeInventoryExtData({
                                key: "inspStickerExp",
                                value: value.getTime(),
                            });
                        }
                    }}
                    name='Sticker Exp. Date'
                />
            </div>
        </div>
    );
});
