import "./index.css";
import { ReactElement, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import { CREATE_ID, USERS_PAGE } from "common/constants/links";
import { GeneralInformation, ROLE_OPTIONS } from "./components/GeneralInformation";
import { SalesPersonInformation } from "./components/SalesPersonInformation";
import { useStore } from "store/hooks";
import { useToastMessage } from "common/hooks";

interface TabItem {
    settingName: string;
    component: ReactElement;
    route: string;
}

export const UsersForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showError, showInfo } = useToastMessage();
    const [searchParams, setSearchParams] = useSearchParams();
    const usersStore = useStore().usersStore;
    const { getCurrentUser, getCurrentUserRoles, currentUserClear, user } = usersStore;
    const hasShownInfo = useRef(false);

    const handleGetCurrentUser = async (useruid: string) => {
        const response = await getCurrentUser(useruid);
        if (response && response.error) {
            showError(response?.error as string);
        }
    };

    useEffect(() => {
        const defaultTabRoute = tabItems[0].route;
        const currentTab = searchParams.get("section");
        if (!currentTab) {
            setSearchParams({ section: defaultTabRoute });
        }
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        if (!id || id === CREATE_ID) return;
        handleGetCurrentUser(id);
        getCurrentUserRoles(id);
        return () => {
            currentUserClear();
        };
    }, [id]);

    const getTabItems = (): TabItem[] => {
        const baseTabs: TabItem[] = [
            {
                settingName: "General Information",
                route: "general-information",
                component: <GeneralInformation />,
            },
        ];

        const salesPersonRole = ROLE_OPTIONS.find((option) => option.name === "Salesman");
        if (user?.rolename === salesPersonRole?.title) {
            baseTabs.push({
                settingName: "Sales Person Information",
                route: "sales-person-information",
                component: <SalesPersonInformation />,
            });
            if (!hasShownInfo.current) {
                showInfo("New section added to the sidebar – check it out!");
                hasShownInfo.current = true;
            }
        } else {
            hasShownInfo.current = false;
        }

        return baseTabs;
    };

    const tabItems = getTabItems();

    const activeTabParam = searchParams.get("section") || tabItems[0].route;
    const activeTabIndex = tabItems.findIndex((section) => section.route === activeTabParam);

    useEffect(() => {
        if (activeTabIndex === -1) {
            const [defaultTab] = tabItems;
            setSearchParams({ section: defaultTab.route });
        }
    }, [activeTabIndex, tabItems, setSearchParams]);

    const handleTabChange = (index: number) => {
        const selectedTabRoute = tabItems[index].route;
        setSearchParams({ section: selectedTabRoute });
    };

    const handleCloseClick = () => {
        navigate(USERS_PAGE.MAIN);
    };

    return (
        <div className='relative user-form-page'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={handleCloseClick}
            />
            <div className='card'>
                <div className='card-header flex'>
                    <h2 className='card-header__title uppercase m-0'>Create User</h2>
                </div>
                <TabView
                    className='user-form-page__tabs'
                    activeIndex={activeTabIndex}
                    onTabChange={(e) => handleTabChange(e.index)}
                >
                    {tabItems.map(({ settingName, component }) => {
                        return (
                            <TabPanel
                                header={settingName}
                                children={component}
                                key={settingName}
                                className='user-form-page__panel'
                            />
                        );
                    })}
                </TabView>
                <div className='user-form-page__buttons'>
                    <Button
                        className='uppercase px-6 form__button'
                        severity='danger'
                        outlined
                        onClick={handleCloseClick}
                    >
                        Cancel
                    </Button>
                    <Button className='uppercase px-6 form__button' severity='success' disabled>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
});
