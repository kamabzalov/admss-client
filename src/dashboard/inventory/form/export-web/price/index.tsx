import { observer } from "mobx-react-lite";
import { Checkbox } from "primereact/checkbox";
import { ReactElement, useState } from "react";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

export const ExportWebPrice = observer((): ReactElement => {
    const [checked, setChecked] = useState<boolean>(true);
    return (
        <div className='grid export-web-price row-gap-2'>
            <label className='cursor-pointer export-web-price__label'>
                <Checkbox
                    checked={checked}
                    onChange={() => {
                        setChecked(!checked);
                    }}
                    className='export-web-price__checkbox'
                />
                Export to Web
            </label>

            <hr className='form-line' />

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText className='export-web-price__text-input w-full' />
                    <label className='float-label'>Model Code</label>
                </span>
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='List price (required)' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Special price' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Cost price' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Extra price 1' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Extra price 2' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Extra price 3' />
            </div>

            <hr className='form-line' />

            <div className='col-12'>
                <InputTextarea
                    placeholder='Dealer comments on vehicle'
                    className='w-full export-web-price__text-area'
                />
            </div>
        </div>
    );
});
