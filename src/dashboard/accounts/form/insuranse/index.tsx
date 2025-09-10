import { TabView, TabPanel } from "primereact/tabview";
import { ReactElement, forwardRef, useImperativeHandle, useRef } from "react";
import { AccountInsuranceHistory } from "./insurance-history";
import { AccountInsuranceInfo, InsuranceInfoRef } from "./insurance-info";
import "./index.css";

export interface AccountInsuranceRef {
    hasUnsavedChanges: () => boolean;
}

export const AccountInsurance = forwardRef<AccountInsuranceRef>((_, ref): ReactElement => {
    const insuranceInfoRef = useRef<InsuranceInfoRef>(null);

    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => {
            return insuranceInfoRef.current?.hasUnsavedChanges() || false;
        },
    }));

    return (
        <div className='account-insurance'>
            <div className='grid'>
                <div className='col-12'>
                    <TabView className='account-insurance__tabs'>
                        <TabPanel header='Insurance'>
                            <AccountInsuranceInfo ref={insuranceInfoRef} />
                        </TabPanel>
                        <TabPanel header='Insurance history'>
                            <AccountInsuranceHistory />
                        </TabPanel>
                    </TabView>
                </div>
            </div>
        </div>
    );
});
