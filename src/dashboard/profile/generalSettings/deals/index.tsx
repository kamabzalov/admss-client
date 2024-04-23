import { DashboardRadio } from "dashboard/common/form/inputs";

interface SettingsDealsProps {
    settings: {
        name: string;
        title: string;
        value: number;
    }[];
}

export const SettingsDeals = ({ settings }: SettingsDealsProps): JSX.Element => {
    return (
        <div className='settings-form'>
            <div className='settings-form__title'>Deals</div>
            <div className='flex'>{settings && <DashboardRadio radioArray={settings} />}</div>
        </div>
    );
};
