import { CurrencyInput } from "dashboard/common/form/inputs";

export const SettingsFees = () => {
    return (
        <div className='flex flex-column gap-4'>
            <div className='text-lg font-semibold'>Fees</div>
            <div className='grid'>
                <div className='col-6'>
                    <CurrencyInput title='Default documentation fee' value={421} />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default vehicle pack' />{" "}
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default title fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default transfer tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default spare tag fee' />
                </div>
                <div className='col-6'>
                    <CurrencyInput title='Default spare transfer tag fee' />
                </div>
            </div>
        </div>
    );
};
