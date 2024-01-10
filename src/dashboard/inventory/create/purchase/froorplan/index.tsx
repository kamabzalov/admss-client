import {
    BorderedCheckbox,
    CurrencyInput,
    DateInput,
    SearchInput,
} from "dashboard/common/form/inputs";
import { ReactElement } from "react";

export const PurchaseFloorplan = (): ReactElement => (
    <div className='grid purchase-floorplan row-gap-2'>
        <div className='col-3'>
            <BorderedCheckbox name='Floorplanned' checked={false} />
        </div>
        <div className='col-6'>
            <SearchInput name='Floor' title='Floorplan Company' />
        </div>
        <div className='col-3'>
            <DateInput name='Reduction Date' />
        </div>
        <div className='col-3'>
            <CurrencyInput name='Reduced amount' />
        </div>
        <div className='col-3'>
            <DateInput name='Pay Off By' />
        </div>
        <div className='col-3'>
            <CurrencyInput name='Remain balance' />
        </div>
    </div>
);
