import { observer } from "mobx-react-lite";
import { ReactElement } from "react";
import "./index.css";
import { CurrencyInput } from "dashboard/common/form/inputs";

export const DealRetailCharges = observer((): ReactElement => {
    return (
        <div className='grid deal-retail-charges row-gap-2'>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='Credit Life' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='A&H/ Disability' />
            </div>
            <div className='col-3'>
                <CurrencyInput labelPosition='top' title='VSI' />
            </div>
        </div>
    );
});
