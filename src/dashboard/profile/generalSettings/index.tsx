import { TabView, TabPanel } from "primereact/tabview";
import "./index.css";
import { SettingsDeals } from "dashboard/profile/generalSettings/deals";
import { SettingsFees } from "dashboard/profile/generalSettings/fees";
import { SettingsTaxes } from "dashboard/profile/generalSettings/taxes";
import { SettingsStockNew } from "dashboard/profile/generalSettings/stockNew";
import { SettingsStockTradeIn } from "dashboard/profile/generalSettings/stockTradeIn";
import { SettingsAccount } from "dashboard/profile/generalSettings/account";
import { SettingsContract } from "dashboard/profile/generalSettings/contract";
import { SettingsLease } from "dashboard/profile/generalSettings/lease";
import { SettingsOther } from "dashboard/profile/generalSettings/other";
import { ReactElement } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { SettingsInventoryGroups } from "./inventory-groups";

interface TabItem {
    settingName: string;
    component: ReactElement;
}

export const GeneralSettings = (): ReactElement => {
    const navigate = useNavigate();
    const tabItems: TabItem[] = [
        {
            settingName: "Deals",
            component: (
                <SettingsDeals
                    settings={[
                        { name: "deal1", title: "Default deal type", value: 0 },
                        { name: "deal3", title: "Default deal status", value: 1 },
                    ]}
                />
            ),
        },
        { settingName: "Fees", component: <SettingsFees /> },
        { settingName: "Taxes", component: <SettingsTaxes /> },
        {
            settingName: "Stock# for new inventory ",
            component: (
                <SettingsStockNew
                    radioSettings={[
                        { name: "6vin", title: "Last 6 of VIN", value: 0 },
                        { name: "8vin", title: "Last 8 of VIN", value: 1 },
                    ]}
                />
            ),
        },
        {
            settingName: "Stock# for trade-in inventory",
            component: (
                <SettingsStockTradeIn
                    radioSettings={[
                        { name: "6vin", title: "Last 6 of VIN", value: 0 },
                        { name: "8vin", title: "Last 8 of VIN", value: 1 },
                    ]}
                />
            ),
        },
        { settingName: "Inventory groups", component: <SettingsInventoryGroups /> },
        { settingName: "Account Settings", component: <SettingsAccount /> },
        { settingName: "Contract Settings", component: <SettingsContract /> },
        { settingName: "Lease Settings", component: <SettingsLease /> },
        { settingName: "Other", component: <SettingsOther /> },
    ];

    return (
        <div className='grid relative general-settings'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={() => navigate("/dashboard")}
            />
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header flex'>
                        <h2 className='card-header__title uppercase m-0'>General settings</h2>
                    </div>
                    <TabView className='general-settings__tabs'>
                        {tabItems.map(({ settingName, component }) => {
                            return (
                                <TabPanel
                                    header={settingName}
                                    children={component}
                                    key={settingName}
                                    className='general-settings__panel'
                                />
                            );
                        })}
                    </TabView>
                </div>
            </div>
        </div>
    );
};
