import { DashboardDialog } from "dashboard/common/dialog";
import { DialogProps } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import "./index.css";
import { SettingsDeals } from "./deals";
import { SettingsFees } from "./fees";
import { SettingsTaxes } from "./taxes";
import { SettingsStockNew } from "./stockNew";
import { SettingsStockTradeIn } from "./stockTradeIn";
import { SettingsAccount } from "./account";
import { SettingsContract } from "./contract";
import { SettingsLease } from "./lease";

interface TabItem {
    settingName: string;
    component: JSX.Element;
}

export const GeneralSettingsDialog = ({ visible, onHide }: DialogProps): JSX.Element => {
    const handleSendSupportContact = (): void => {
        onHide();
        return;
    };

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
        { settingName: "Account Settings", component: <SettingsAccount /> },
        { settingName: "Contract Settings", component: <SettingsContract /> },
        { settingName: "Lease Settings", component: <SettingsLease /> },
    ];

    return (
        <>
            <DashboardDialog
                className='dialog__general-settings general-settings'
                footer='Save'
                header='General settings'
                visible={visible}
                onHide={onHide}
                action={handleSendSupportContact}
            >
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
            </DashboardDialog>
        </>
    );
};
