import { Button } from "primereact/button";
import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { TabPanel, TabView } from "primereact/tabview";
import { AccountInformation } from "dashboard/accounts/form/information";
import { AccountDownPayment } from "dashboard/accounts/form/down-payment";
import { AccountInsurance } from "dashboard/accounts/form/insurance";
import { AccountManagement } from "dashboard/accounts/form/management";
import { AccountNotes } from "dashboard/accounts/form/notes";
import { AccountPaymentHistory } from "dashboard/accounts/form/payment-history";
import { AccountPromiseToPay } from "dashboard/accounts/form/promise-to-pay";
import { AccountSettings } from "dashboard/accounts/form/settings";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { Loader } from "dashboard/common/loader";
import { NoticeAlert } from "dashboard/accounts/form/common";
import { useFormExitConfirmation, useToastMessage } from "common/hooks";
import { ACCOUNTS_PAGE } from "common/constants/links";

interface TabItem {
    tabName: string;
    component?: ReactElement;
}

enum TabName {
    ACCOUNT_INFORMATION = "Account information",
    ACCOUNT_MANAGEMENT = "Account Management",
    PAYMENT_HISTORY = "Payment History",
    DOWN_PAYMENT = "Down Payment",
    ACCOUNT_SETTINGS = "Account Settings",
    NOTES = "Notes",
    PROMISE_TO_PAY = "Promise To Pay",
    INSURANCE = "Insurance",
}

const transformTabName = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export const AccountsForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showError, showWarning } = useToastMessage();
    const location = useLocation();
    const store = useStore().accountStore;
    const {
        getAccount,
        isAccountChanged,
        accountNote,
        getNotes,
        account: { accountnumber, accountstatus },
        saveAccount,
        clearAccount,
        isLoading,
    } = store;
    const [activeTab, setActiveTab] = useState<number>(0);
    const [hasInsuranceUnsavedChanges, setHasInsuranceUnsavedChanges] = useState<boolean>(false);

    const tabItems: TabItem[] = [
        { tabName: TabName.ACCOUNT_INFORMATION, component: <AccountInformation /> },
        { tabName: TabName.ACCOUNT_MANAGEMENT, component: <AccountManagement /> },
        { tabName: TabName.PAYMENT_HISTORY, component: <AccountPaymentHistory /> },
        { tabName: TabName.DOWN_PAYMENT, component: <AccountDownPayment /> },
        { tabName: TabName.ACCOUNT_SETTINGS, component: <AccountSettings /> },
        { tabName: TabName.NOTES, component: <AccountNotes /> },
        { tabName: TabName.PROMISE_TO_PAY, component: <AccountPromiseToPay /> },
        {
            tabName: TabName.INSURANCE,
            component: <AccountInsurance onUnsavedChangesChange={setHasInsuranceUnsavedChanges} />,
        },
    ];

    useEffect(() => {
        store.prevPath = `${location.pathname}${location.search}`;
    }, [location.pathname, location.search, store]);

    const handleGetAccount = async () => {
        if (!id) return;
        const response = await getAccount(id);
        if (response?.error) {
            showError(response.error as string);
            navigate(ACCOUNTS_PAGE.MAIN);
        } else {
            getNotes(id);
        }
    };

    useEffect(() => {
        handleGetAccount();
        return () => {
            accountNote.note = "";
            accountNote.alert = "";
            clearAccount();
        };
    }, [id]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tab = queryParams.get("tab");
        const tabIndex = tab
            ? tabItems.findIndex((item) => transformTabName(item.tabName) === tab)
            : 0;
        setActiveTab(tabIndex >= 0 ? tabIndex : 0);
    }, [location.search]);

    const { handleExitClick, ConfirmModalComponent } = useFormExitConfirmation({
        isFormChanged: isAccountChanged,
        onConfirmExit: () => navigate(ACCOUNTS_PAGE.MAIN),
        className: "account-confirm-dialog",
    });

    const handleTabChange = (index: number) => {
        const currentTabIndex = activeTab;
        const currentTabName = tabItems[currentTabIndex]?.tabName;

        if (currentTabName === TabName.INSURANCE && hasInsuranceUnsavedChanges) {
            showWarning(
                `The insurance data in ${TabName.INSURANCE.toUpperCase()} section has not been saved.`
            );
        }

        setActiveTab(index);
        const tabName = transformTabName(tabItems[index].tabName);
        const queryParams = new URLSearchParams(location.search);
        queryParams.set("tab", tabName);
        navigate(`${ACCOUNTS_PAGE.EDIT(id ?? "")}?${queryParams.toString()}`, { replace: true });
    };

    const handleSaveAccount = async () => {
        const response = await saveAccount();
        if (response?.error) {
            showError(response.error);
        } else {
            navigate(ACCOUNTS_PAGE.MAIN);
        }
    };

    return isLoading ? (
        <Loader overlay />
    ) : (
        <div className='grid relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={handleExitClick}
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
                                {(accountNote.alert || accountNote.note) && <NoticeAlert />}
                            </div>
                        )}
                    </div>
                    <div className='card-content account__card grid'>
                        <div className='col-12'>
                            <TabView
                                className='account__tabs'
                                activeIndex={activeTab}
                                onTabChange={(e) => handleTabChange(e.index)}
                                panelContainerClassName='card-content__wrapper'
                            >
                                {tabItems.map(({ tabName, component }) => {
                                    return (
                                        <TabPanel
                                            header={tabName}
                                            key={tabName}
                                            className='account__panel h-full'
                                        >
                                            {component}
                                        </TabPanel>
                                    );
                                })}
                            </TabView>
                        </div>
                    </div>
                    <div className='account__footer gap-3 ml-auto mr-3'>
                        <Button
                            className='uppercase px-6 account__button'
                            onClick={() => handleTabChange(activeTab - 1)}
                            disabled={activeTab <= 0}
                            outlined
                            severity={activeTab <= 0 ? "secondary" : "success"}
                        >
                            Back
                        </Button>
                        <Button
                            className='uppercase px-6 account__button'
                            onClick={() => handleTabChange(activeTab + 1)}
                            disabled={activeTab === tabItems.length - 1}
                            severity={activeTab === tabItems.length - 1 ? "secondary" : "success"}
                            outlined
                        >
                            Next
                        </Button>
                        <Button
                            disabled={!isAccountChanged}
                            severity={isAccountChanged ? "success" : "secondary"}
                            className='uppercase px-6 account__button'
                            onClick={handleSaveAccount}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
            <ConfirmModalComponent />
        </div>
    );
});
