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
        <>
            <div className='text-lg pb-4 font-semibold'>Deals</div>
            {settings && <DashboardRadio radioArray={settings} />}
        </>
    );
};
