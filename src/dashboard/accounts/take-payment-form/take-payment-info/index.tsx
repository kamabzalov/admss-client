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
                sectionTitle='Current Status'
                info={[
                    { title: "Past Due Amt", value: "$0.00" },
                    { title: "Current Due", value: "$0.00" },
                    { title: "Down/Pickup Due", value: "$0.00" },
                    { title: "Fees", value: "$0.00" },
                    { title: "Total Due", value: "$0.00" },
                    { title: "Current Balance", value: "$0.00" },
                ]}
            />

            <InfoSection
                sectionTitle='Collection Details'
                info={[
                    { title: "Regular Pmt", value: "$0.00 Monthly" },
                    { title: "Next Pmt. due", value: "07/07/2024" },
                    { title: "Days Overdue", value: "3" },
                    { title: "Last Paid", value: "Never" },
                    { title: "Last Paid Days", value: "n/a" },
                    { title: "Last Late", value: "Never" },
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
