import "./index.css";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { TabView, TabPanel } from "primereact/tabview";
import { useNavigate, useLocation } from "react-router-dom";
import { AdditionalInformation } from "dashboard/profile/users/form/components/SalesPersonInformation/tabs/AdditionalInformation";
import { TypicalOptions } from "dashboard/profile/users/form/components/SalesPersonInformation/tabs/TypicalOptions";
import { BackendOptions } from "dashboard/profile/users/form/components/SalesPersonInformation/tabs/BackendOptions";

const tabs = [
    { header: "Additional Information", component: <AdditionalInformation /> },
    { header: "Typical Options", component: <TypicalOptions /> },
    { header: "Back-End Options", component: <BackendOptions /> },
];

export const SalesPersonInformation = observer((): ReactElement => {
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("salesTab");

    const handleTabChange = (e: { index: number }) => {
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set("salesTab", e.index.toString());
        navigate({
            pathname: location.pathname,
            search: newSearchParams.toString(),
        });
    };

    const activeTabIndex = tabParam ? parseInt(tabParam, 10) : 0;

    return (
        <div className='user-form sales-person-information'>
            <h3 className='sales-person-information__title user-form__title'>
                Sales Person Information
            </h3>
            <TabView
                className='sales-person-information__tabs'
                activeIndex={activeTabIndex}
                onTabChange={handleTabChange}
            >
                {tabs.map((tab, index) => (
                    <TabPanel key={index} header={tab.header}>
                        {tab.component}
                    </TabPanel>
                ))}
            </TabView>
        </div>
    );
});
