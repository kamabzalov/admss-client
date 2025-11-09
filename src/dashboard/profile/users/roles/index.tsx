import "./index.css";
import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RolesContacts } from "dashboard/profile/users/roles/contacts";
import { RolesDeals } from "dashboard/profile/users/roles/deals";
import { RolesInventory } from "dashboard/profile/users/roles/inventory";
import { RolesAccounts } from "dashboard/profile/users/roles/accounts";
import { RolesReports } from "dashboard/profile/users/roles/reports";
import { RolesSettings } from "dashboard/profile/users/roles/settings";
import { RolesOther } from "dashboard/profile/users/roles/other";

interface TabItem {
    tabName: string;
    component: ReactElement;
}

const tabItems: TabItem[] = [
    { tabName: "CONTACTS", component: <RolesContacts /> },
    { tabName: "DEALS", component: <RolesDeals /> },
    { tabName: "INVENTORY", component: <RolesInventory /> },
    { tabName: "ACCOUNTS", component: <RolesAccounts /> },
    { tabName: "REPORTS", component: <RolesReports /> },
    { tabName: "SETTINGS", component: <RolesSettings /> },
    { tabName: "OTHER", component: <RolesOther /> },
];

interface Role {
    roleId: string;
    roleName: string;
}

const mockRoles: Role[] = [{ roleId: "new", roleName: "New role" }];

export default observer(function UsersRoles(): ReactElement {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedRoleId, setSelectedRoleId] = useState<string>("new");
    const [roleName, setRoleName] = useState<string>("");
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam) {
            setSelectedRoleId(roleParam);
        }
    }, [searchParams]);

    const handleRoleSelect = (roleId: string) => {
        setSelectedRoleId(roleId);
        setSearchParams({ role: roleId });
        setActiveTabIndex(0);
    };

    const handleTabChange = (changeEvent: { index: number }) => {
        setActiveTabIndex(changeEvent.index);
    };

    const handleBackClick = () => {
        const newIndex = Math.max(activeTabIndex - 1, 0);
        setActiveTabIndex(newIndex);
    };

    const handleNextClick = () => {
        const newIndex = Math.min(activeTabIndex + 1, tabItems.length - 1);
        setActiveTabIndex(newIndex);
    };

    const handleSaveClick = () => {};

    const handleCloseClick = () => {
        navigate(-1);
    };

    return (
        <div className='grid roles-page'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={handleCloseClick}
            />
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>CREATE NEW ROLE</h2>
                    </div>
                    <div className='roles-content'>
                        <div className='roles-sidebar'>
                            <div className='roles-list'>
                                {mockRoles.map((role) => (
                                    <div
                                        key={role.roleId}
                                        className={`roles-list-item ${selectedRoleId === role.roleId ? "active" : ""}`}
                                        onClick={() => handleRoleSelect(role.roleId)}
                                    >
                                        {role.roleName}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='roles-main'>
                            <div className='roles-main__header'>
                                <span className='p-float-label'>
                                    <InputText
                                        value={roleName}
                                        onChange={(event) => setRoleName(event.target.value)}
                                        className='roles-main__input'
                                    />
                                    <label className='float-label'>Role name (required)</label>
                                </span>
                                <label className='roles-main__select-all'>
                                    <input type='checkbox' />
                                    <span>Select All</span>
                                </label>
                            </div>
                            <TabView
                                className='roles-main__tabs'
                                activeIndex={activeTabIndex}
                                onTabChange={handleTabChange}
                            >
                                {tabItems.map(({ tabName, component }) => {
                                    return (
                                        <TabPanel header={tabName} key={tabName}>
                                            {component}
                                        </TabPanel>
                                    );
                                })}
                            </TabView>
                            <div className='roles-main__buttons'>
                                <Button
                                    onClick={handleBackClick}
                                    className='uppercase px-6'
                                    disabled={activeTabIndex <= 0}
                                    severity={activeTabIndex <= 0 ? "secondary" : "success"}
                                    outlined
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNextClick}
                                    disabled={activeTabIndex >= tabItems.length - 1}
                                    severity={
                                        activeTabIndex >= tabItems.length - 1
                                            ? "secondary"
                                            : "success"
                                    }
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button
                                    onClick={handleSaveClick}
                                    className='uppercase px-6'
                                    severity='success'
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
