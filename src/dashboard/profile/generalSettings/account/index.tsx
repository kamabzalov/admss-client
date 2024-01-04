import { CurrencyInput, PercentInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { Slider, SliderChangeEvent } from "primereact/slider";
import { useState, ChangeEvent } from "react";
import "./index.css";
import { InputNumber, InputNumberChangeEvent } from "primereact/inputnumber";

interface SettingsAccountProps {
    settings?: any;
}

export const SettingsAccount = ({ settings }: SettingsAccountProps) => {
    const [valueDigits, setValueDigits] = useState<number>(2);
    const [value, setValue] = useState<number>(5);
    return (
        <div className='account flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Account Settings</div>
            <div className='flex justify-content-between align-items-center account-start-number'>
                <label className='account-start-number__label ml-2 wrap'>
                    Start number (starts from 0 by default)
                </label>
                <InputText
                    value={"0"}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {}}
                    className='account-start-number__input'
                />
            </div>
            <div className='flex align-items-center'>
                <label className='ml-2'>Fixed digits</label>
                <div className='flex-1 ml-8'>
                    <InputNumber
                        value={valueDigits}
                        max={10}
                        onChange={(e: InputNumberChangeEvent) => setValueDigits(Number(e.value))}
                        className='w-full'
                    />
                    <Slider
                        value={valueDigits}
                        onChange={(e: SliderChangeEvent) => setValueDigits(Number(e.value))}
                        max={10}
                        className='w-full'
                    />
                </div>
            </div>
            <div className='flex align-items-center justify-content-between'>
                <span className='p-float-label'>
                    <InputText className='account__input' />
                    <label className='float-label'>Prefix</label>
                </span>
                <span className='p-float-label'>
                    <InputText className='account__input' />
                    <label className='float-label'>Suffix</label>
                </span>
            </div>
            <div className='flex align-items-center justify-content-between'>
                <div className='account-late-fee'>
                    <CurrencyInput title='Late fee (min)' />
                </div>
                <div className='account-late-fee'>
                    <CurrencyInput title='Late fee (max)' />
                </div>
            </div>
            <div className='flex align-items-center justify-content-between account-grace'>
                <label htmlFor={settings} className='account-grace__label'>
                    Late fee grace period
                </label>
                <div className='account-grace__input'>
                    <InputNumber
                        className='account-grace__input'
                        max={10}
                        value={value}
                        onChange={(e: InputNumberChangeEvent) => setValue(Number(e.value))}
                    />
                    <Slider
                        value={value}
                        onChange={(e: SliderChangeEvent) => setValue(Number(e.value))}
                        max={10}
                        className='w-full'
                    />
                </div>
            </div>
            <div className='account-percentage'>
                <PercentInput className='account-percentage__input' title='Late fee percentage' />
            </div>
        </div>
    );
};
