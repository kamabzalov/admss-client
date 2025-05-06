import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { DashboardRadio } from "dashboard/common/form/inputs";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
interface SettingsStockTradeInProps {
    radioSettings: {
        name: string;
        title: string;
        value: number;
    }[];
}

export const SettingsStockTradeIn = observer(({ radioSettings }: SettingsStockTradeInProps) => {
    const store = useStore().generalSettingsStore;
    const { settings, changeSettings } = store;
    return (
        <div className='grid'>
            <div className='col-3'>
                <div className='flex align-items-center stock-trade-in__input'>
                    <Checkbox
                        inputId='stocknumtiSequental'
                        name='stocknumtiSequental'
                        checked={!!settings.stocknumtiSequental}
                        onChange={(e) => {
                            changeSettings("stocknumtiSequental", e.checked ? 1 : 0);
                        }}
                    />
                    <label htmlFor='stocknumtiSequental' className='ml-2'>
                        Sequental
                    </label>
                </div>
            </div>
            <div className='col-3'>
                <div className='flex align-items-center stock-trade-in__input'>
                    <Checkbox
                        inputId='stocknumtiFromSoldVehicle'
                        name='stocknumtiFromSoldVehicle'
                        checked={!!settings.stocknumtiFromSoldVehicle}
                        onChange={(e) => {
                            changeSettings("stocknumtiFromSoldVehicle", e.checked ? 1 : 0);
                        }}
                    />
                    <label htmlFor='stocknumtiFromSoldVehicle' className='ml-2'>
                        From sold vehicle
                    </label>
                </div>
            </div>
            <hr className='form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='stock-new__input'
                        value={settings.stocknumtiPrefix}
                        onChange={(e) => {
                            changeSettings("stocknumtiPrefix", e.target.value);
                        }}
                    />
                    <label className='float-label'>Prefix</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='stock-new__input'
                        value={settings.stocknumtiSuffix}
                        onChange={(e) => {
                            changeSettings("stocknumtiSuffix", e.target.value);
                        }}
                    />
                    <label className='float-label'>Suffix</label>
                </span>
            </div>
            <div className='col-6'>
                <DashboardRadio radioArray={radioSettings} />
            </div>

            <div className='col-6 mt-3'>
                <span className='p-float-label stock-ti__slider'>
                    <InputNumber
                        value={settings.stocknumtiFixedDigits}
                        max={10}
                        onChange={(e: InputNumberChangeEvent) =>
                            changeSettings("stocknumtiFixedDigits", Number(e.value))
                        }
                        className='w-full'
                    />
                    <Slider
                        value={settings.stocknumtiFixedDigits}
                        onChange={(e: SliderChangeEvent) =>
                            changeSettings("stocknumtiFixedDigits", Number(e.value))
                        }
                        max={10}
                        className='w-full'
                    />
                    <label htmlFor='stocknumtiFixedDigits' className='float-label'>
                        Fixed digits
                    </label>
                </span>
            </div>
        </div>
    );
});
