import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import "./index.css";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import logo from "assets/images/logo.svg";
import { AuthUser } from "common/models/user";
import { logout } from "http/services/auth.service";
import { useLocation, useNavigate } from "react-router-dom";
import { LS_LAST_ROUTE, LastRouteData } from "common/constants/localStorage";
import { useAuth } from "common/providers/AuthProvider";
import { SupportContactDialog } from "dashboard/profile/supportContact";
import { SupportHistoryDialog } from "dashboard/profile/supportHistory";
import { ProfileAvatar } from "dashboard/profile/common/profile-avatar";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { getExtendedData } from "http/services/auth-user.service";
import { usePermissions } from "common/hooks/usePermissions";
import {
    CONTACT_SUPPORT,
    HELP_PAGE,
    HOME_PAGE,
    SETTINGS_PAGE,
    USERS_PAGE,
    USER_PROFILE_PAGE,
} from "common/constants/links";

export const Header = observer((): ReactElement => {
    const store = useStore().userStore;
    const { authUser, isSettingsLoaded } = store;
    const { logout: authLogout } = useAuth();
    const { canAccessSettings, canAccessUsers } = usePermissions();
    const menuRight = useRef<Menu>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [supportContact, setSupportContact] = useState<boolean>(
        new URLSearchParams(location.search).has(CONTACT_SUPPORT)
    );
    const [supportHistory, setSupportHistory] = useState<boolean>(false);
    const [showChangeLocation, setShowChangeLocation] = useState<boolean>(false);

    useEffect(() => {
        if (!authUser) {
            setShowChangeLocation(false);
            return;
        }

        getExtendedData(authUser.useruid).then((response) => {
            setShowChangeLocation(!!response?.locations && response.locations.length > 1);
        });
    }, [authUser?.useruid]);

    const signOut = async ({ useruid, token }: AuthUser) => {
        const currentPath = window.location.pathname + window.location.search;
        const routeData: LastRouteData = {
            path: currentPath,
            timestamp: Date.now(),
            useruid,
        };
        localStorage.setItem(LS_LAST_ROUTE, JSON.stringify(routeData));
        await logout(useruid, token);
        authLogout();
        navigate(HOME_PAGE, { replace: true });
    };

    const removeSupportHistoryParam = () => {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete(CONTACT_SUPPORT);
        navigate({ search: searchParams.toString() }, { replace: true });
    };

    const menuItems = useMemo(() => {
        const showSettingsMenu = canAccessSettings();
        const showUsersMenu = canAccessUsers();
        const hasManageSectionItems = showChangeLocation || showUsersMenu;

        return [
            {
                label: "My Profile",
                command: () => navigate(USER_PROFILE_PAGE.MAIN),
            },
            showSettingsMenu
                ? { label: "General Settings", command: () => navigate(SETTINGS_PAGE.MAIN) }
                : null,
            { separator: true },
            showChangeLocation ? { label: "Change Location" } : null,
            showUsersMenu ? { label: "Users", command: () => navigate(USERS_PAGE.MAIN) } : null,
            hasManageSectionItems ? { separator: true } : null,
            {
                label: "Contact support",
                command() {
                    setSupportContact(true);
                },
            },
            {
                label: "Support history",
                command() {
                    setSupportHistory(true);
                },
            },
            {
                label: "Help",
                command() {
                    window.open(HELP_PAGE, "_blank");
                },
            },
            { separator: true },
            {
                label: "Logout",
                command() {
                    authUser && signOut(authUser);
                },
            },
        ].filter(Boolean) as MenuItem[];
    }, [authUser, canAccessSettings, canAccessUsers, showChangeLocation, navigate]);

    if (!isSettingsLoaded) {
        return <></>;
    }

    if (menuRight) {
        return (
            <header className='header header--collapsed'>
                <img src={logo} alt='ADMSS' className='header__logo header__logo--collapsed' />

                <div className='header__content'>
                    <div className='header__info'>
                        <span className='header__name'>{authUser?.loginname}</span>

                        <span className='header__location'>{authUser?.locationname}</span>
                    </div>

                    <div className='header__menu'>
                        <Menu model={menuItems} popup ref={menuRight} popupAlignment='right' />
                        <ProfileAvatar
                            className='header__icon'
                            size={60}
                            editable={false}
                            onClick={(event) => menuRight?.current?.toggle(event)}
                        />
                    </div>
                </div>
                {authUser && (
                    <>
                        <SupportContactDialog
                            onHide={() => {
                                setSupportContact(false);
                                removeSupportHistoryParam();
                            }}
                            visible={supportContact}
                        />
                        <SupportHistoryDialog
                            onHide={() => setSupportHistory(false)}
                            visible={supportHistory}
                        />
                    </>
                )}
            </header>
        );
    }
    return <></>;
});
