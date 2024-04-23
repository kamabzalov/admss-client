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
            <div className='grid account-start-number mt-2'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputText
                            value={"0"}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {}}
                            className='account-start-number__input'
                        />
                        <label className='account-start-number__label float-label'>
                            Start number (starts from 0 by default)
                        </label>
                    </span>
                </div>
                <div className='col-6'>
                    <span className='p-float-label'>
                        <InputNumber
                            value={valueDigits}
                            max={10}
                            onChange={(e: InputNumberChangeEvent) =>
                                setValueDigits(Number(e.value))
                            }
                            className='w-full'
                        />
                        <Slider
                            value={valueDigits}
                            onChange={(e: SliderChangeEvent) => setValueDigits(Number(e.value))}
                            max={10}
                            className='w-full'
                        />
                        <label className='float-label'>Fixed digits</label>
                    </span>
                </div>
                <hr className='form-line' />
                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputText className='account__input' />
                        <label className='float-label'>Prefix</label>
                    </span>
                </div>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <InputText className='account__input' />
                        <label className='float-label'>Suffix</label>
                    </span>
                </div>
                <div className='col-3'>
                    <CurrencyInput title='Late fee (min)' labelPosition='top' />
                </div>
                <div className='col-3'>
                    <CurrencyInput title='Late fee (max)' labelPosition='top' />
                </div>
                <div className='col-6 mt-3'>
                    <span className='p-float-label'>
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
                        <label htmlFor={settings} className='float-label'>
                            Late fee grace period
                        </label>
                    </span>
                </div>
                <div className='col-3 mt-3'>
                    <PercentInput
                        className='account-percentage__input'
                        title='Late fee percentage'
                        labelPosition='top'
                    />
                </div>
            </div>
        </div>
    );
};
