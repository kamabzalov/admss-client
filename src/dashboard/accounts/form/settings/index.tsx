import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { ReactElement, useState } from "react";

import "./index.css";
import { Button } from "primereact/button";
import { ACCOUNT_STATUS_LIST } from "common/constants/account-options";

export const AccountSettings = (): ReactElement => {
    const [accountStatus, setAccountStatus] = useState<string>("");
    return (
        <div className='account-settings'>
            <h3 className='account-settings__title account-title'>Account Settings</h3>

            <div className='account-settings__header grid'>
                <div className='col-3'>
                    <span className='p-float-label'>
                        <Dropdown
                            className='w-full'
                            options={ACCOUNT_STATUS_LIST}
                            optionValue='name'
                            optionLabel='name'
                            value={accountStatus}
                            onChange={({ value }) => setAccountStatus(value)}
                        />
                        <label className='float-label'>Account Status</label>
                    </span>
                </div>
                <div className='col-3 account-settings__checkbox'>
                    <Checkbox
                        inputId='account-settings-cash-only'
                        name='account-settings-cash-only'
                        checked={false}
                    />
                    <label htmlFor='account-settings-cash-only' className='ml-2'>
                        Mark Account Cash Only
                    </label>
                </div>
                <div className='col-3 account-settings__checkbox'>
                    <Checkbox
                        inputId='account-settings-cash-only'
                        name='account-settings-cash-only'
                        checked={false}
                    />
                    <label htmlFor='account-settings-cash-only' className='ml-2'>
                        Do Not Report To Credit Bureau
                    </label>
                </div>

                <hr className='form-line' />

                <div className='col-6'>
                    <Button className='account-settings__button' outlined>
                        Change Payment Due Date
                    </Button>
                </div>
                <div className='col-6'>
                    <Button className='account-settings__button'>Update Total Amount Paid</Button>
                </div>
            </div>
        </div>
    );
};
