import { ReactElement, useState } from "react";
import { PercentInput } from "dashboard/common/form/inputs";
import { ComboBox } from "dashboard/common/form/dropdown";

const PAYMENT_FREQUENCY_OPTIONS = [
    { label: "Weekly", value: 0 },
    { label: "Bi-weekly", value: 1 },
    { label: "Monthly", value: 2 },
];

export const SettingsContactInterestRate = (): ReactElement => {
    const [interestRate, setInterestRate] = useState<number | null>(0);
    const [paymentFrequency, setPaymentFrequency] = useState<number | null>(null);

    return (
        <div className='grid settings-contact__interest-rate'>
            <div className='col-3'>
                <PercentInput
                    className='settings-contact__interest-rate-input'
                    title='Default interest rate'
                    labelPosition='top'
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.value ?? null)}
                />
            </div>
            <div className='col-3'>
                <ComboBox
                    className='settings-contact__interest-rate-dropdown'
                    label='Payment frequency'
                    options={PAYMENT_FREQUENCY_OPTIONS}
                    optionLabel='label'
                    optionValue='value'
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.value ?? null)}
                />
            </div>
        </div>
    );
};
