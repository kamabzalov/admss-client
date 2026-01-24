import "./index.css";
import { ReactElement, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { PersonalInformation } from "dashboard/profile/userProfile/personal-information";
import { Security } from "dashboard/profile/userProfile/security";
import { Payments } from "dashboard/profile/userProfile/payments";
import { DASHBOARD_PAGE } from "common/constants/links";
import { observer } from "mobx-react-lite";
import { DataTableWrapper } from "dashboard/common/data-table";
import { useStore } from "store/hooks";

interface TabItem {
    settingName: string;
    component: ReactElement;
    route: string;
}

export const UserProfile = observer((): ReactElement => {
    const store = useStore().profileStore;
    const { isProfileChanged } = store;
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabItems: TabItem[] = [
        {
            settingName: "Personal information",
            route: "personal-information",
            component: <PersonalInformation />,
        },
        {
            settingName: "Security",
            route: "security",
            component: <Security />,
        },
        {
            settingName: "Payments",
            route: "payments",
            component: <Payments />,
        },
    ];

    useEffect(() => {
        const defaultTabRoute = tabItems[0].route;
        const currentTab = searchParams.get("section");
        if (!currentTab) {
            setSearchParams({ section: defaultTabRoute });
        }
    }, [searchParams, setSearchParams]);

    const activeTabParam = searchParams.get("section") || tabItems[0].route;
    const activeTabIndex = tabItems.findIndex((section) => section.route === activeTabParam);

    const handleTabChange = (index: number) => {
        const selectedTabRoute = tabItems[index].route;
        setSearchParams({ section: selectedTabRoute });
    };

    const handleCloseClick = () => {
        navigate(DASHBOARD_PAGE);
    };

    const handleSave = () => {
        return;
    };

    return (
        <DataTableWrapper className='grid user-profile'>
            <Button
                icon='pi pi-times'
                className='user-profile__close-button'
                onClick={handleCloseClick}
            />
            <div className='col-12'>
                <div className='card user-profile__card'>
                    <div className='card-header user-profile__header'>
                        <h2 className='user-profile__title'>MY PROFILE</h2>
                    </div>
                    <TabView
                        className='user-profile__tabs'
                        activeIndex={activeTabIndex}
                        onTabChange={(e) => handleTabChange(e.index)}
                    >
                        {tabItems.map(({ settingName, component }) => {
                            return (
                                <TabPanel
                                    header={settingName}
                                    children={component}
                                    key={settingName}
                                    className='user-profile__panel'
                                />
                            );
                        })}
                    </TabView>
                    <div className='user-profile__buttons'>
                        <Button
                            className='user-profile__update-button form-nav__button'
                            onClick={handleSave}
                            disabled={!isProfileChanged}
                            severity={isProfileChanged ? "success" : "secondary"}
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </div>
        </DataTableWrapper>
    );
});
