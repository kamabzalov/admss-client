import "./index.css";
import { ReactElement, useState } from "react";
import { TabPanel, TabView } from "primereact/tabview";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";
import { SettingsContactTypes } from "dashboard/profile/generalSettings/contact-settings/contact-types";
import { SettingsContactInterestRate } from "dashboard/profile/generalSettings/contact-settings/interest-rate";

const TABS = [
    { header: "Contact types", component: <SettingsContactTypes /> },
    { header: "Interest rate", component: <SettingsContactInterestRate /> },
];

export const SettingsContact = (): ReactElement => {
    const [activeTab, setActiveTab] = useState<number>(0);

    return (
        <SettingsSection title='Contact settings' className='settings-contact'>
            <TabView
                className='settings-contact__tabs'
                activeIndex={activeTab}
                onTabChange={(e) => setActiveTab(e.index)}
            >
                {TABS.map((tab) => (
                    <TabPanel
                        key={tab.header}
                        header={tab.header}
                        pt={{
                            header: {
                                className: "heading-condensed",
                            },
                        }}
                    >
                        {tab.component}
                    </TabPanel>
                ))}
            </TabView>
        </SettingsSection>
    );
};
