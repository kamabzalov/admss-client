import "./index.css";
import { observer } from "mobx-react-lite";
import { TabPanel, TabView } from "primereact/tabview";
import { ReactElement, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { RolesContacts } from "dashboard/profile/users/roles/form/contacts";
import { RolesDeals } from "dashboard/profile/users/roles/form/deals";
import { RolesInventory } from "dashboard/profile/users/roles/form/inventory";
import { RolesAccounts } from "dashboard/profile/users/roles/form/accounts";
import { RolesReports } from "dashboard/profile/users/roles/form/reports";
import { RolesSettings } from "dashboard/profile/users/roles/form/settings";
import { RolesOther } from "dashboard/profile/users/roles/form/other";
import { useStore } from "store/hooks";
import { CREATE_ID, USERS_PAGE } from "common/constants/links";
import { TruncatedText } from "dashboard/common/display";
import { useToastMessage } from "common/hooks";

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

export const UsersRolesForm = observer((): ReactElement => {
    const navigate = useNavigate();
    const { id } = useParams();
    const usersStore = useStore().usersStore;
    const { showError, showSuccess } = useToastMessage();
    const {
        getCurrentRole,
        currentRole,
        changeCurrentRole,
        saveCurrentRole,
        createNewRole,
        togglePermissionsGroup,
    } = usersStore;
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    useEffect(() => {
        if (id === CREATE_ID) {
            createNewRole();
        } else if (id) {
            getCurrentRole(id);
        }
    }, [id]);

    const handleTabChange = (changeEvent: { index: number }) => {
        setActiveTabIndex(changeEvent.index);
    };

    const handleBackClick = () => {
        const newIndex = Math.max(activeTabIndex - 1, 0);
        setActiveTabIndex(newIndex);
        if (newIndex <= 0) {
            navigate(USERS_PAGE.ROLES());
        }
    };

    const handleNextClick = () => {
        const newIndex = Math.min(activeTabIndex + 1, tabItems.length - 1);
        setActiveTabIndex(newIndex);
    };

    const handleSaveClick = async () => {
        if (!currentRole) return;
        const response = await saveCurrentRole();
        if (response && response.error) {
            showError(response?.error);
        } else {
            showSuccess(
                id === CREATE_ID ? "Role created successfully" : "Role updated successfully"
            );
            navigate(USERS_PAGE.ROLES());
        }
    };

    const handleCloseClick = () => {
        navigate(-1);
    };

    return (
        <div className='grid role-page relative'>
            <Button
                icon='pi pi-times'
                className='p-button close-button'
                onClick={handleCloseClick}
            />
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>
                            {id === CREATE_ID ? "Create new" : "Edit"} Role
                        </h2>
                    </div>
                    <div className='role-content'>
                        <div className='role-sidebar'>
                            <div className='role-list pr-2'>
                                <TruncatedText
                                    text={
                                        id === CREATE_ID ? "New role" : currentRole?.rolename || ""
                                    }
                                    withTooltip={true}
                                    tooltipOptions={{
                                        position: "mouse",
                                        content:
                                            id === CREATE_ID ? "New role" : currentRole?.rolename,
                                    }}
                                />
                            </div>
                        </div>
                        <div className='role-main'>
                            <div className='role-main__header'>
                                <span className='p-float-label'>
                                    <InputText
                                        value={currentRole?.rolename}
                                        onChange={(event) =>
                                            changeCurrentRole("rolename", event.target.value)
                                        }
                                        className='role-main__input'
                                    />
                                    <label className='float-label'>Role name (required)</label>
                                </span>
                                <label className='role-main__select-all'>
                                    <input
                                        type='checkbox'
                                        onChange={() => togglePermissionsGroup()}
                                    />
                                    <span>Select All</span>
                                </label>
                            </div>
                            <TabView
                                className='role-main__tabs'
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
                        </div>
                    </div>
                    <div className='role-main__buttons'>
                        <Button
                            onClick={handleBackClick}
                            className='form__button uppercase'
                            outlined
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleNextClick}
                            disabled={activeTabIndex >= tabItems.length - 1}
                            severity={
                                activeTabIndex >= tabItems.length - 1 ? "secondary" : "success"
                            }
                            className='form__button uppercase'
                            outlined
                        >
                            Next
                        </Button>
                        <Button
                            onClick={handleSaveClick}
                            className='form__button uppercase'
                            severity='success'
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
});
