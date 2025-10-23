import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { Splitter } from "dashboard/common/display";
import { BorderedCheckbox } from "dashboard/common/form/inputs";

export const TypicalOptions = observer((): ReactElement => {
    return (
        <div className='typical-options mt-4'>
            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Select All' checked={false} />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Vehicle Profit' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Overallowance' checked={false} />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Discount' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Acquision/ Loan Fee' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Reserve' checked={false} />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Manager Override' checked={false} />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Misc. Cost' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Misc. Profit' checked={false} />
                </div>
            </div>
        </div>
    );
});
