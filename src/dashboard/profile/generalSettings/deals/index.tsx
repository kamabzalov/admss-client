import "./index.css";
import { DashboardRadio } from "dashboard/common/form/inputs";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";
import { ReactElement } from "react";

interface SettingsDealsProps {
    settings: {
        name: string;
        title: string;
        value: number;
    }[];
}

export const SettingsDeals = ({ settings }: SettingsDealsProps): ReactElement => {
    return (
        <SettingsSection title='Deals' className='settings-deals'>
            {settings && <DashboardRadio radioArray={settings} />}
        </SettingsSection>
    );
};
