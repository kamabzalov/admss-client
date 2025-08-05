import "./index.css";
import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "store/hooks";
import { SettingsInventoryGroups } from "dashboard/profile/generalSettings/inventory-settings/inventory-groups";
import { SettingsStockNew } from "dashboard/profile/generalSettings/inventory-settings/stockNew";
import { SettingsStockTradeIn } from "dashboard/profile/generalSettings/inventory-settings/stockTradeIn";
import { SettingsInventoryOptions } from "dashboard/profile/generalSettings/inventory-settings/inventory-options";
import { SettingsInventoryDefaults } from "dashboard/profile/generalSettings/inventory-settings/default";

const tabs = [
    { header: "Groups", component: <SettingsInventoryGroups /> },
    { header: "Options", component: <SettingsInventoryOptions /> },
    {
        header: "Defaults",
        component: <SettingsInventoryDefaults />,
    },
    {
        header: "Stock# new",
        component: <SettingsStockNew />,
    },
    {
        header: "Stock# trade-in",
        component: <SettingsStockTradeIn />,
    },
];

export enum VIN_SETTINGS {
    LAST_6_OF_VIN,
    LAST_8_OF_VIN,
}

export const radioVINSettings = [
    {
        name: `setting-${VIN_SETTINGS.LAST_6_OF_VIN}`,
        title: "Last 6 of VIN",
        value: VIN_SETTINGS.LAST_6_OF_VIN,
    },
    {
        name: `setting-${VIN_SETTINGS.LAST_8_OF_VIN}`,
        title: "Last 8 of VIN",
        value: VIN_SETTINGS.LAST_8_OF_VIN,
    },
];

export const InventorySettings = observer((): ReactElement => {
    const store = useStore().generalSettingsStore;
    const { activeTab, getUserGroupList } = store;
    const navigate = useNavigate();
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get("tab");

    useEffect(() => {
        store.activeTab = tabParam ? parseInt(tabParam, 10) : 0;
        store.tabLength = tabs.length;
        return () => {
            store.activeTab = null;
            store.tabLength = 0;
        };
    }, [tabParam]);

    useEffect(() => {
        getUserGroupList();
    }, []);

    const handleTabChange = (e: { index: number }) => {
        const newSearchParams = new URLSearchParams(location.search);
        newSearchParams.set("tab", e.index.toString());
        navigate({
            pathname: location.pathname,
            search: newSearchParams.toString(),
        });
    };

    return (
        <div className='col-12 settings-inventory'>
            <div className='settings-form__title'>Inventory settings</div>
            <TabView
                className='settings-inventory__tabs'
                activeIndex={activeTab || 0}
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
