import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { useStore } from "store/hooks";

export const DealGeneralOdometer = observer((): ReactElement => {
    const store = useStore().dealStore;
    const {
        dealExtData: { OdometerReading, OdomDigits, OdomInExcess, OdomNotActual },
        changeDealExtData,
    } = store;
    return (
        <div className='grid deal-general-odometer row-gap-2'>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='deal-odometer__text-input w-full'
                        value={OdometerReading}
                        onChange={(e) =>
                            changeDealExtData({ key: "OdometerReading", value: e.target.value })
                        }
                    />
                    <label className='float-label'>Reading ar Time of Sale (r.)</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <Dropdown
                        value={OdomDigits}
                        onChange={(e) => changeDealExtData({ key: "OdomDigits", value: e.value })}
                        options={[5, 6, 7, 8]}
                        filter
                        required
                        className='w-full deal-odometer__dropdown'
                    />
                    <label className='float-label'>Number of Digits (req.)</label>
                </span>
            </div>
            <div className='col-3'>
                <div className='deal-odometer__checkbox flex'>
                    <Checkbox
                        inputId='deal-odometer-reflects'
                        className='mt-1'
                        name='deal-odometer-reflects'
                        checked={!!OdomInExcess}
                        onChange={() =>
                            changeDealExtData({ key: "OdomInExcess", value: Number(!OdomInExcess) })
                        }
                    />
                    <label htmlFor='deal-odometer-reflects' className='ml-2'>
                        Odometer reflects the amount of mileage IN EXCESS of its mechanical limits
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='deal-odometer__checkbox flex'>
                    <Checkbox
                        inputId='deal-odometer-not-actual'
                        className='mt-1'
                        name='deal-odometer-not-actual'
                        checked={!!OdomNotActual}
                        onChange={() =>
                            changeDealExtData({
                                key: "OdomNotActual",
                                value: Number(!OdomNotActual),
                            })
                        }
                    />
                    <label htmlFor='deal-odometer-not-actual' className='ml-2'>
                        Odometer is NOT the actual mileage
                    </label>
                </div>
            </div>
        </div>
    );
});
