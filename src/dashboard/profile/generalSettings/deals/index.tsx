import "./index.css";
import { DashboardRadio } from "dashboard/common/form/inputs";
import { SettingsSection } from "dashboard/profile/generalSettings/common/section";

interface SettingsDealsProps {
    settings: {
        name: string;
        title: string;
        value: number;
    }[];
}

export const SettingsDeals = ({ settings }: SettingsDealsProps): JSX.Element => {
    return (
        <SettingsSection title='Deals' className='settings-deals'>
            {settings && <DashboardRadio radioArray={settings} />}
        </SettingsSection>
    );
};
