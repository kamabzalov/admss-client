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
    SETTINGS_PAGE,
} from "common/constants/links";
import { typeGuards } from "common/utils";
import { usePermissions } from "common/hooks/usePermissions";

export const Sidebar = observer((): ReactElement => {
    const store = useStore().userStore;
    const { inventoryPermissions, contactPermissions, dealPermissions, salesPermissions } =
        usePermissions();
    const { authUser, settings } = store;
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

    const renderNavItem = (
        to: string,
        icon: string | ReactElement,
        label: string,
        className: string = ""
    ): ReactElement => {
        const itemId = `nav-item-${to.replace(/\//g, "-")}`;
        return (
            <li className={`sidebar-nav__item ${className}`}>
                {settings.isSidebarCollapsed && (
                    <Tooltip target={`#${itemId}`} content={label} position='right' />
                )}
                <Link to={to} id={itemId} className='sidebar-nav__link'>
                    {typeGuards.isString(icon) ? (
                        <div className={`sidebar-nav__icon ${icon}`}></div>
                    ) : (
                        icon
                    )}
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
                {inventoryPermissions.canSeeInMenu() &&
                    renderNavItem(INVENTORY_PAGE.MAIN, "inventory", "Inventory")}
                {salesPermissions.canShowContacts() &&
                    contactPermissions.canSeeInMenu() &&
                    renderNavItem(CONTACTS_PAGE.MAIN, "contacts", "Contacts")}
                {salesPermissions.canShowDeals() &&
                    dealPermissions.canSeeInMenu() &&
                    renderNavItem(DEALS_PAGE.MAIN, "deals", "Deals")}
                {salesPermissions.canShowAccounts() &&
                    renderNavItem(ACCOUNTS_PAGE.MAIN, "accounts", "Accounts")}
                {salesPermissions.canShowReports() &&
                    renderNavItem(REPORTS_PAGE.MAIN, "reports", "Reports")}
                {salesPermissions.canShowTasks() &&
                    renderNavItem(TASKS_PAGE.MAIN, "tasks", "Tasks")}
                {salesPermissions.canShowExportWeb() &&
                    renderNavItem(EXPORT_WEB_PAGE.MAIN, "export-web", "Export to WEB")}
                {renderNavItem(
                    SETTINGS_PAGE.MAIN,
                    <i className='sidebar-nav__icon adms-settings' />,
                    "Settings",
                    "sidebar-nav__item--settings"
                )}
            </ul>
        </aside>
    );
});
