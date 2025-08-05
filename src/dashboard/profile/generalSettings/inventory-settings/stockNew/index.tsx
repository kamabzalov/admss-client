import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { DashboardRadio } from "dashboard/common/form/inputs";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";
import { observer } from "mobx-react-lite";
import { useStore } from "store/hooks";
import {
    VIN_SETTINGS,
    radioVINSettings,
} from "dashboard/profile/generalSettings/inventory-settings";

export const SettingsStockNew = observer(() => {
    const store = useStore().generalSettingsStore;
    const { settings, changeSettings } = store;
    return (
        <div className='grid'>
            <div className='col-3 ml-2'>
                <div className='flex align-items-center'>
                    <Checkbox
                        inputId='stocknumSequental'
                        name='stocknumSequental'
                        checked={!!settings.stocknumSequental}
                        onChange={(e) => {
                            changeSettings("stocknumSequental", e.checked ? 1 : 0);
                        }}
                    />
                    <label className='ml-2'>Sequental</label>
                </div>
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='stock-new__input'
                        value={settings.stocknumPrefix || ""}
                        onChange={(e) => {
                            changeSettings("stocknumPrefix", e.target.value);
                        }}
                    />
                    <label className='float-label'>Prefix</label>
                </span>
            </div>
            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='stock-new__input'
                        value={settings.stocknumSuffix || ""}
                        onChange={(e) => {
                            changeSettings("stocknumSuffix", e.target.value);
                        }}
                    />
                    <label className='float-label'>Suffix</label>
                </span>
            </div>
            <div className='col-6'>
                <DashboardRadio
                    radioArray={radioVINSettings}
                    onChange={(value) => {
                        if (value === `${VIN_SETTINGS.LAST_6_OF_VIN}`) {
                            changeSettings("stocknumLast6ofVIN", VIN_SETTINGS.LAST_6_OF_VIN);
                            changeSettings("stocknumLast8ofVIN", VIN_SETTINGS.LAST_8_OF_VIN);
                        } else {
                            changeSettings("stocknumLast6ofVIN", VIN_SETTINGS.LAST_8_OF_VIN);
                            changeSettings("stocknumLast8ofVIN", VIN_SETTINGS.LAST_6_OF_VIN);
                        }
                    }}
                    initialValue={
                        !settings.stocknumLast6ofVIN && !settings.stocknumLast8ofVIN
                            ? null
                            : settings.stocknumLast6ofVIN === VIN_SETTINGS.LAST_6_OF_VIN
                              ? `${VIN_SETTINGS.LAST_6_OF_VIN}`
                              : `${VIN_SETTINGS.LAST_8_OF_VIN}`
                    }
                />
            </div>

            <div className='col-6 mt-3'>
                <span className='p-float-label stock-new__slider'>
                    <InputNumber
                        value={settings.stocknumFixedDigits}
                        max={10}
                        onChange={(e: InputNumberChangeEvent) =>
                            changeSettings("stocknumFixedDigits", Number(e.value))
                        }
                        className='w-full'
                    />
                    <Slider
                        value={settings.stocknumFixedDigits}
                        onChange={(e: SliderChangeEvent) =>
                            changeSettings("stocknumFixedDigits", Number(e.value))
                        }
                        max={10}
                        className='w-full'
                    />
                    <label className='float-label'>Fixed digits</label>
                </span>
            </div>
        </div>
    );
});
