import { ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getInsuranceHistory } from "http/services/accounts.service";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { AccountInsurance } from "common/models/accounts";
import { observer } from "mobx-react-lite";

export const AccountInsuranceInfo = observer((): ReactElement => {
    const { id } = useParams();
    const [insuranceInfo, setInsuranceInfo] = useState<AccountInsurance>();

    useEffect(() => {
        if (id) {
            getInsuranceHistory(id).then((res) => {
                if (res) setInsuranceInfo(res as AccountInsurance);
            });
        }
    }, [id]);

    return (
        <div className='insurance-info'>
            <div className='insurance-info__item'>
                <div className='insurance-field'>
                    <label>Insurance Company:</label>
                    <span>{insuranceInfo?.Insurance_Company}</span>
                </div>
                <div className='insurance-field'>
                    <label>Insurance Agent:</label>
                    <span>{insuranceInfo?.Insurance_Agent_Name}</span>
                </div>
                <div className='insurance-field'>
                    <label>Policy#:</label>
                    <span>{insuranceInfo?.Insurance_Policy_Number}</span>
                </div>
                <div className='insurance-field'>
                    <Checkbox
                        inputId='account-insurance-policy'
                        name='account-insurance-policy'
                        checked={false}
                    />
                    <label htmlFor='account-insurance-policy' className='ml-2'>
                        Insurance Policy Received
                    </label>
                </div>
                <div className='insurance-field'>
                    <label>Expiration Date:</label>
                    <span>{insuranceInfo?.Insurance_Exp_Date}</span>
                </div>
            </div>
            <div className='insurance-info__item'>
                <div className='insurance-field'>
                    <Checkbox
                        inputId='account-insurance-title-received'
                        name='account-insurance-title-received'
                        checked={false}
                    />
                    <label htmlFor='account-insurance-title-received' className='ml-2'>
                        Title Received
                    </label>
                </div>
                <span className='p-float-label'>
                    <InputText />
                    <label className='float-label'>Title#</label>
                </span>
            </div>
            <div className='insurance-info__footer'>
                <Button className='insurance-info__button'>Save</Button>
            </div>
        </div>
    );
});
