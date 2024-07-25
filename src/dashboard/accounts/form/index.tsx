import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { TabPanel, TabView } from "primereact/tabview";
import { AccountInformation } from "./information";
import { AccountDownPayment } from "./down-payment";
import { AccountInsurance } from "./insuranse";
import { AccountManagement } from "./management";
import { AccountNotes } from "./notes";
import { AccountPaymentHistory } from "./payment-history";
import { AccountPromiseToPay } from "./promise-to-pay";
import { AccountSettings } from "./settings";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

interface TabItem {
    tabName: string;
    component?: ReactElement;
}
const tabItems: TabItem[] = [
    { tabName: "Account information", component: <AccountInformation /> },
    { tabName: "Account Management", component: <AccountManagement /> },
    { tabName: "Payment History", component: <AccountPaymentHistory /> },
    { tabName: "Down Payment", component: <AccountDownPayment /> },
    { tabName: "Account Settings", component: <AccountSettings /> },
    { tabName: "Notes", component: <AccountNotes /> },
    { tabName: "Promise To Pay", component: <AccountPromiseToPay /> },
    { tabName: "Insurance", component: <AccountInsurance /> },
];

export const AccountsForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const { id } = useParams();
    const store = useStore().accountStore;
    const {
        getAccount,
        account: { accountnumber, accountstatus },
    } = store;
    const [activeTab, setActiveTab] = useState<number>(0);
    useEffect(() => {
        id && getAccount(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    return (
        <div className='grid relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate("/dashboard/accounts")}
            />
            <div className='col-12'>
                <div className='card account'>
                    <div className='card-header flex'>
                        <h2 className='card-header__title uppercase m-0'>Edit account</h2>
                        {id && (
                            <div className='card-header-info'>
                                Account Number
                                <span className='card-header-info__data'>{accountnumber}</span>
                                Status
                                <span className='card-header-info__data uppercase'>
                                    {accountstatus}
                                </span>
                                Overdue Status
                                <span className='card-header-info__data'>54</span>
                            </div>
                        )}
                    </div>
                    <div className='card-content account__card grid'>
                        <TabView
                            className='account__tabs'
                            activeIndex={activeTab}
                            onTabChange={(e) => setActiveTab(e.index)}
                            panelContainerClassName='card-content__wrapper'
                        >
                            {tabItems.map(({ tabName, component }) => {
                                return (
                                    <TabPanel
                                        header={tabName}
                                        children={component}
                                        key={tabName}
                                        className='account__panel h-full'
                                    />
                                );
                            })}
                        </TabView>
                    </div>
                    <div className='account__footer gap-3 ml-auto mr-3'>
                        <Button
                            className='uppercase px-6 account__button'
                            onClick={() => setActiveTab(activeTab - 1)}
                            disabled={activeTab === 0}
                        >
                            Back
                        </Button>
                        <Button
                            className='uppercase px-6 account__button'
                            onClick={() => setActiveTab(activeTab + 1)}
                            disabled={activeTab === tabItems.length - 1}
                        >
                            Next
                        </Button>
                        <Button className='uppercase px-6 account__button'>Update</Button>
                    </div>
                </div>
            </div>
        </div>
    );
});
