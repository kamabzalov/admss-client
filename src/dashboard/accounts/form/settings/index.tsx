import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { ReactElement } from "react";

import "./index.css";
import { Button } from "primereact/button";

export const AccountSettings = (): ReactElement => {
    return (
        <div className='account-settings'>
            <h3 className='account-settings__title account-title'>Account Settings</h3>

            <div className='account-settings__header grid'>
                <div className='col-3'>
                    <Dropdown
                        className='w-full'
                        options={["Account status"]}
                        value='Account status'
                    />
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
