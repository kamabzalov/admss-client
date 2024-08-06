import { ReactElement, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { InfoSection } from "dashboard/accounts/form/information/info-section";
import { InputTextarea } from "primereact/inputtextarea";
import { getPaymentInfo } from "http/services/accounts.service";
import { useParams } from "react-router-dom";

export const TakePaymentInfo = observer((): ReactElement => {
    const { id } = useParams();
    const [, setPaymentInfo] = useState<any>({});

    useEffect(() => {
        id && getPaymentInfo(id).then((res) => setPaymentInfo(res));
    }, [id]);

    return (
        <div className='take-payment__info'>
            <InfoSection
                title='Current Status'
                details={[
                    `Past Due Amt: $0.00`,
                    `Current Due: $0.00`,
                    `Down/Pickup Due: $0.00`,
                    `Fees: $0.00`,
                    `Total Due: $0.00`,
                    `Current Balance: $0.00`,
                ]}
            />

            <InfoSection
                title='Collection Details'
                details={[
                    `Regular Pmt: $0.00 Monthly`,
                    `Next Pmt. due: 07/07/2024`,
                    `Days Overdue: 3`,
                    `Last Paid: Never`,
                    `Last Paid Days: n/a`,
                    `Last Late: Never`,
                ]}
            />

            <div className='account-note mt-3'>
                <span className='p-float-label'>
                    <InputTextarea id='account-memo' className='account-note__input' />
                    <label htmlFor='account-memo'>Account Memo</label>
                </span>
                <Button severity='secondary' className='account-note__button' label='Save' />
            </div>
            <div className='account-note mt-3'>
                <span className='p-float-label'>
                    <InputTextarea id='account-payment' className='account-note__input' />
                    <label htmlFor='account-payment'>Payment Alert</label>
                </span>
                <Button severity='secondary' className='account-note__button' label='Save' />
            </div>
        </div>
    );
});
