import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import "./index.css";
import { DashboardRadio } from "dashboard/common/form/inputs";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { useState } from "react";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";

interface SettingsStockTradeInProps {
    settings?: any;
    radioSettings: {
        name: string;
        title: string;
        value: number;
    }[];
}

export const SettingsStockTradeIn = ({ settings, radioSettings }: SettingsStockTradeInProps) => {
    const [value, setValue] = useState<number>(5);
    return (
        <div className='stock-trade-in flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Stock# for trade-in</div>
            <div className='flex justify-content-between'>
                <div className='flex align-items-center stock-trade-in__input'>
                    <Checkbox inputId={settings} name={settings} value={settings} checked />
                    <label htmlFor={settings} className='ml-2'>
                        Sequental
                    </label>
                </div>
                <div className='flex align-items-center stock-trade-in__input'>
                    <Checkbox inputId={settings} name={settings} value={settings} checked />
                    <label htmlFor={settings} className='ml-2'>
                        From sold vehicle
                    </label>
                </div>
            </div>
            <div className='flex align-items-center justify-content-between'>
                <span className='p-float-label'>
                    <InputText className='stock-trade-in__input' />
                    <label className='float-label'>Prefix</label>
                </span>
                <span className='p-float-label'>
                    <InputText className='stock-trade-in__input' />
                    <label className='float-label'>Suffix</label>
                </span>
            </div>
            <DashboardRadio radioArray={radioSettings} />
            <div className='flex'>
                <label htmlFor={settings} className='ml-2'>
                    Fixed digits
                </label>
                <div className='flex-1 ml-8'>
                    <InputNumber
                        value={value}
                        max={10}
                        onChange={(e: InputNumberChangeEvent) => setValue(Number(e.value))}
                        className='w-full'
                    />
                    <Slider
                        value={value}
                        onChange={(e: SliderChangeEvent) => setValue(Number(e.value))}
                        max={10}
                        className='w-full'
                    />
                </div>
            </div>
        </div>
    );
};
