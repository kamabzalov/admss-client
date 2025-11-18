import { ReactElement, useEffect, useState } from "react";
import "./index.css";
import { useLocation, useNavigate } from "react-router-dom";
import { TabPanel, TabView } from "primereact/tabview";
import { AccountsDataTable } from "./account-list";
import { AccountsAudit } from "./audit";

export { AccountsDataTable } from "./account-list";

interface TabItem {
    tabName: string;
    component: ReactElement;
}

export const Accounts = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const tabItems: TabItem[] = [
        { tabName: "Accounts", component: <AccountsDataTable /> },
        { tabName: "Audit", component: <AccountsAudit /> },
    ];

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (tab) {
            const index = tabItems.findIndex((item) => item.tabName === tab);
            if (index !== -1) {
                setActiveIndex(index);
            }
        }
    }, [location.search]);

    const handleTabChange = (event: { index: number }) => {
        const tabName = tabItems[event.index].tabName;
        setActiveIndex(event.index);
        navigate(`?tab=${tabName}`);
    };

    return (
        <div className='grid accounts'>
            <div className='col-12'>
                <TabView className='card' activeIndex={activeIndex} onTabChange={handleTabChange}>
                    {tabItems.map(({ tabName, component }) => (
                        <TabPanel
                            header={tabName}
                            headerClassName='card-header accounts__header uppercase m-0'
                            children={component}
                            key={tabName}
                        />
                    ))}
                </TabView>
            </div>
        </div>
    );
};
