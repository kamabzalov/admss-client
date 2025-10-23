import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { BorderedCheckbox } from "dashboard/common/form/inputs";
import { Splitter } from "dashboard/common/display";

export const BackendOptions = observer((): ReactElement => {
    return (
        <div className='backend-options mt-4'>
            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Select All' checked={false} />
                </div>
            </div>

            <Splitter className='mb-3' />

            <div className='grid'>
                <div className='col-3'>
                    <BorderedCheckbox name='Warranty Profit' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='GAP Profit' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Accessory Profit' checked={false} />
                </div>{" "}
                <div className='col-3'>
                    <BorderedCheckbox name='Credit Life Profit' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='A&H Profit' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='VSI Profit' checked={false} />
                </div>{" "}
                <div className='col-3'>
                    <BorderedCheckbox name='Vehicle Pack' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Doc Fee' checked={false} />
                </div>
                <div className='col-3'>
                    <BorderedCheckbox name='Interest Markup' checked={false} />
                </div>
            </div>
        </div>
    );
});
