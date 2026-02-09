import "./index.css";
import { ReactElement, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { observer } from "mobx-react-lite";
import { CREATE_ID, USERS_PAGE } from "common/constants/links";
import { GeneralInformation } from "./components/GeneralInformation";
import { AdditionalSettings } from "./components/AdditionalSettings";
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
    const { showError, showSuccess } = useToastMessage();
    const [searchParams, setSearchParams] = useSearchParams();
    const usersStore = useStore().usersStore;
    const authUserStore = useStore().userStore;
    const { authUser } = authUserStore;
    const {
        getCurrentUser,
        getCurrentUserRoles,
        currentUserClear,
        isFormValid,
        isUserChanged,
        createUser,
        updateUser,
        loadAvailableRoles,
    } = usersStore;
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
        if (authUser) {
            loadAvailableRoles(authUser.useruid);
        }
    }, [authUser]);

    useEffect(() => {
        if (!id || id === CREATE_ID) {
            currentUserClear();
            return;
        }
        handleGetCurrentUser(id);
        getCurrentUserRoles(id);
        return () => {
            currentUserClear();
        };
    }, [id]);

    const getTabItems = (): TabItem[] => {
        return [
            {
                settingName: "General Information",
                route: "general-information",
                component: <GeneralInformation />,
            },
            {
                settingName: "Additional Settings",
                route: "additional-settings",
                component: <AdditionalSettings />,
            },
        ];
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

    const handleSaveClick = async () => {
        if (id === CREATE_ID) {
            const response = await createUser();
            if (response && response.error) {
                showError(response?.error);
                return;
            }
            showSuccess("User created successfully");
            currentUserClear();
            navigate(USERS_PAGE.MAIN);
            return;
        }

        if (!id) return;

        if (!usersStore.user.roleuid || !usersStore.user.roleuid.trim()) {
            showError("Role not selected");
            return;
        }

        const response = await updateUser(id);
        if (response && response.error) {
            showError(response?.error as string);
            return;
        }
        showSuccess("User updated successfully");
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
                    <h2 className='card-header__title uppercase m-0'>
                        {id === CREATE_ID ? "Create new" : "Edit"} User
                    </h2>
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
                    <Button
                        className='uppercase px-6 form__button'
                        severity={
                            id === CREATE_ID
                                ? isFormValid
                                    ? "success"
                                    : "secondary"
                                : isUserChanged
                                  ? "success"
                                  : "secondary"
                        }
                        type='submit'
                        disabled={id === CREATE_ID ? !isFormValid : !isUserChanged}
                        onClick={handleSaveClick}
                    >
                        {id === CREATE_ID ? "Create" : "Update"}
                    </Button>
                </div>
            </div>
        </div>
    );
});
