import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement } from "react";
import { AccountInsuranceHistory } from "dashboard/accounts/form/insurance/insurance-history";
import { AccountInsuranceInfo } from "dashboard/accounts/form/insurance/insurance-info";
import "./index.css";

export interface AccountInsuranceProps {
    onUnsavedChangesChange?: (hasChanges: boolean) => void;
}

export const AccountInsurance = ({
    onUnsavedChangesChange,
}: AccountInsuranceProps): ReactElement => {
    return (
        <div className='account-insurance'>
            <div className='grid'>
                <div className='col-12'>
                    <TabView className='account-insurance__tabs'>
                        <TabPanel header='Insurance'>
                            <AccountInsuranceInfo onUnsavedChangesChange={onUnsavedChangesChange} />
                        </TabPanel>
                        <TabPanel header='Insurance history'>
                            <AccountInsuranceHistory />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
};
