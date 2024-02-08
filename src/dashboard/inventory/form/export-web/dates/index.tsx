import { DateInput } from "dashboard/common/form/inputs";
import { observer } from "mobx-react-lite";
import { ReactElement } from "react";

export const ExportWebDates = observer((): ReactElement => {
    return (
        <div className='grid export-web-dates row-gap-2'>
            <div className='col-3'>
                <DateInput name='In Stock Date' />
            </div>

            <hr className='form-line' />

            <div className='col-3'>
                <DateInput name='Last Modified Date' />
            </div>
            <div className='col-3'>
                <DateInput name='Last Export Date' />
            </div>
        </div>
    );
});
