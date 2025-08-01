import "./index.css";
import { Link } from "react-router-dom";
import { useState, useEffect, ReactElement } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { getUserSettings, setUserSettings } from "http/services/auth-user.service";
import { ServerUserSettings } from "common/models/user";
import {
    ACCOUNTS_PAGE,
    CONTACTS_PAGE,
    DASHBOARD_PAGE,
    DEALS_PAGE,
    EXPORT_WEB_PAGE,
    INVENTORY_PAGE,
    REPORTS_PAGE,
    TASKS_PAGE,
} from "common/constants/links";

export const Sidebar = observer((): ReactElement => {
    const store = useStore().userStore;
    const { authUser, settings, isSettingsLoaded } = store;
    const [isSalesPerson, setIsSalesPerson] = useState(true);
    const [serverSettings, setServerSettings] = useState<ServerUserSettings | undefined>(undefined);

    useEffect(() => {
        if (authUser) {
            getUserSettings(authUser.useruid).then((response) => {
                if (response?.profile?.length) {
                    let allSettings: ServerUserSettings = {} as ServerUserSettings;
                    try {
                        allSettings = JSON.parse(response.profile);
                    } catch (error) {
                        allSettings = {} as ServerUserSettings;
                    }
                    setServerSettings(allSettings);
                    if (allSettings?.sidebar?.isSidebarCollapsed !== undefined) {
                        settings.isSidebarCollapsed = !allSettings.sidebar.isSidebarCollapsed;
                    }
                }
                store.isSettingsLoaded = true;
            });
        }
    }, [settings]);

    const changeSettings = (newSidebarSettings: { isSidebarCollapsed: boolean }) => {
        if (authUser && serverSettings !== undefined) {
            const updatedSettings: ServerUserSettings = {
                ...serverSettings,
                sidebar: {
                    ...serverSettings?.sidebar,
                    ...newSidebarSettings,
                },
            };
            setServerSettings(updatedSettings);
            setUserSettings(authUser.useruid, updatedSettings);
        }
    };

    const handleToggleSidebar = () => {
        settings.toggleSidebar();
        changeSettings({ isSidebarCollapsed: !settings.isSidebarCollapsed });
    };

    useEffect(() => {
        if (authUser && Object.keys(authUser.permissions).length) {
            const { permissions } = authUser;
            const { uaSalesPerson, ...otherPermissions } = permissions;
            if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                return setIsSalesPerson(false);
            }
            if (!!uaSalesPerson) setIsSalesPerson(true);
        }
    }, [authUser, authUser?.permissions]);

    const renderNavItem = (to: string, iconClass: string, label: string): ReactElement => {
        const itemId = `nav-item-${to.replace(/\//g, "-")}`;
        return (
            <li className='sidebar-nav__item'>
                {settings.isSidebarCollapsed && (
                    <Tooltip target={`#${itemId}`} content={label} position='right' />
                )}
                <Link to={to} id={itemId} className='sidebar-nav__link'>
                    <div className={`sidebar-nav__icon ${iconClass}`}></div>
                    {!settings.isSidebarCollapsed && <span>{label}</span>}
                </Link>
            </li>
        );
    };

    if (!isSettingsLoaded) {
        return <></>;
    }

    return (
        <aside
            className={`sidebar hidden lg:block ${settings.isSidebarCollapsed ? "collapsed" : ""}`}
        >
            <Button
                className='sidebar-toggle'
                onClick={handleToggleSidebar}
                rounded
                icon='pi pi-angle-left'
                aria-label={`${settings.isSidebarCollapsed ? "Expand" : "Collapse"} sidebar`}
                tooltip={`${settings.isSidebarCollapsed ? "Expand" : "Collapse"} sidebar`}
                pt={{
                    icon: {
                        className: `${settings.isSidebarCollapsed ? "pi pi-angle-right" : "pi pi-angle-left"}`,
                    },
                }}
            />
            <ul className='sidebar-nav'>
                {renderNavItem(DASHBOARD_PAGE, "home", "Home")}
                {renderNavItem(INVENTORY_PAGE.MAIN, "inventory", "Inventory")}
                {isSalesPerson || (
                    <>
                        {renderNavItem(CONTACTS_PAGE.MAIN, "contacts", "Contacts")}
                        {renderNavItem(DEALS_PAGE.MAIN, "deals", "Deals")}
                        {renderNavItem(ACCOUNTS_PAGE.MAIN, "accounts", "Accounts")}
                        {renderNavItem(REPORTS_PAGE.MAIN, "reports", "Reports")}
                        {renderNavItem(EXPORT_WEB_PAGE.MAIN, "export-web", "Export to Web")}
                        {renderNavItem(TASKS_PAGE.MAIN, "tasks", "Tasks")}
                    </>
                )}
            </ul>
        </aside>
    );
});
