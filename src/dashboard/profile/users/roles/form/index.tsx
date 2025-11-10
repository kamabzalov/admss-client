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
    const { getCurrentRole, currentRole, changeCurrentRole } = usersStore;
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    useEffect(() => {
        if (id && id !== CREATE_ID) {
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
                        <h2 className='card-header__title uppercase m-0'>
                            {id === CREATE_ID ? "Create new" : "Edit"} Role
                        </h2>
                    </div>
                    <div className='roles-content'>
                        <div className='roles-sidebar'>
                            <div className='roles-list pr-2'>
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
                        <div className='roles-main'>
                            <div className='roles-main__header'>
                                <span className='p-float-label'>
                                    <InputText
                                        value={currentRole?.rolename}
                                        onChange={(event) =>
                                            changeCurrentRole("rolename", event.target.value)
                                        }
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
                        </div>
                    </div>{" "}
                    <div className='roles-main__buttons'>
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
