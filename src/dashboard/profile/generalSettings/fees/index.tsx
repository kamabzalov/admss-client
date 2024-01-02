import { CurrencyInput } from "dashboard/common/form/inputs";

export const SettingsFees = () => {
    return (
        <>
            <div className='text-lg pb-4 font-semibold'>Fees</div>
            <CurrencyInput title='Default documentation fee' value={421} />
            <CurrencyInput title='Default vehicle pack' />
            <CurrencyInput title='Default title fee' />
            <CurrencyInput title='Default tag fee' />
            <CurrencyInput title='Default transfer tag fee' />
            <CurrencyInput title='Default spare tag fee' />
            <CurrencyInput title='Default spare transfer tag fee' />
        </>
    );
};
