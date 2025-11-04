import "./index.css";
import { Link } from "react-router-dom";
import { useState, useEffect, ReactElement } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { Tooltip } from "primereact/tooltip";
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
    const { authUser, settings } = store;
    const [isSalesPerson, setIsSalesPerson] = useState(true);
    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        if (authUser) {
            store.isSettingsLoaded = true;
            setIsInitialRender(false);
        }
    }, [authUser]);

    const handleMouseEnter = () => {
        settings.isSidebarCollapsed = false;
    };

    const handleMouseLeave = () => {
        settings.isSidebarCollapsed = true;
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
                    <span
                        className={
                            settings.isSidebarCollapsed
                                ? "sidebar-nav__label--hidden"
                                : "sidebar-nav__label--visible"
                        }
                    >
                        {label}
                    </span>
                </Link>
            </li>
        );
    };

    return (
        <aside
            className={`sidebar hidden lg:block ${settings.isSidebarCollapsed ? "collapsed" : ""} ${isInitialRender ? "no-transition" : ""}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
