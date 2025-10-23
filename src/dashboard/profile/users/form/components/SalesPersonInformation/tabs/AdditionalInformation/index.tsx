import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { Splitter } from "dashboard/common/display";
import {
    CURRENCY_OPTIONS,
    CurrencyInput,
    StateDropdown,
    TextInput,
} from "dashboard/common/form/inputs";

export const AdditionalInformation = observer((): ReactElement => {
    return (
        <div className='additional-information'>
            <Splitter title='Address' className='my-5' />
            <div className='grid row-gap-2'>
                <div className='col-6'>
                    <TextInput className='w-full' name='Street Address' />
                </div>
                <div className='col-3'>
                    <StateDropdown className='w-full' name='State' />
                </div>
                <div className='col-3'>
                    <TextInput className='w-full' name='City' />
                </div>
                <div className='col-3'>
                    <TextInput className='w-full' name='Zip Code' />
                </div>
            </div>
            <Splitter title='License' className='my-5' />
            <div className='grid'>
                <div className='col-6'>
                    <TextInput className='w-full' name='License Number' />
                </div>
            </div>
            <Splitter title='Commission' className='my-5' />
            <div className='grid'>
                <div className='col-3'>
                    <CurrencyInput
                        currencyIcon={CURRENCY_OPTIONS.DOLLAR}
                        className='w-full'
                        name='Commission Rate'
                        value={0}
                    />
                </div>
            </div>
        </div>
    );
});
