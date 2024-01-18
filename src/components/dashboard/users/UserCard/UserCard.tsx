/* eslint-disable no-unused-vars */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    getUserExtendedInfo,
    getUserLocations,
    getUserPermissions,
    getUserProfile,
    getUserSettings,
    getUserShortInfo,
    getUserStatistics,
    listSalesPersons,
    listSubusers,
    listUserLogins,
    listUserSessions,
    setUserPermissions,
} from "components/dashboard/users/user.service";
import { TabDataWrapper, TabNavigate, TabPanel } from "components/dashboard/helpers/helpers";
import { PrimaryButton } from "components/dashboard/smallComponents/buttons/PrimaryButton";
import { AxiosError } from "axios";
import { useToast } from "../../helpers/renderToastHelper";
import { Status } from "common/interfaces/ActionStatus";
import { UserStatistics } from "./UserStatistics";
import { UserTemplatesReports } from "./TemplatesReports";
import { UserTemplatesPrintedForm } from "./TemplatesPrintedForm";
import { ApiKeys } from "../ApiKeys/ApiKeys";
import { LOC_STORAGE_USER } from "common/app-consts";
import { LoginResponse } from "common/auth.service";
import { DataExports } from "./dataExport/DataExport";

enum UserCardTabs {
    Profile = "Profile",
    ExtendedInfo = "Extended info",
    ShortInfo = "Short info",
    Locations = "Locations",
    UserPermissions = "User permissions",
    Settings = "Settings",
    Sessions = "Sessions",
    Logins = "Logins",
    Subusers = "Subusers",
    SalesPersons = "Sales persons",
    Statistics = "Statistics",
    TemplatesForReports = "Templates for reports",
    TemplatesForPrintedForms = "Templates for printed forms",
    ApiKeys = "Api Keys",
    DataExport = "Data Export",
}

const userCardTabsArray: string[] = Object.values(UserCardTabs) as string[];

export function UserCard() {
    const { id } = useParams();
    const { useruid }: LoginResponse = JSON.parse(localStorage.getItem(LOC_STORAGE_USER) ?? "");
    const [activeTab, setActiveTab] = useState<UserCardTabs>(UserCardTabs.Profile);
    const [profileJson, setProfileJson] = useState<string>("");
    const [extendedInfoJSON, setExtendedInfoJSON] = useState<string>("");
    const [shortInfoJSON, setShortInfoJSON] = useState<string>("");
    const [locationsJSON, setLocationsJSON] = useState<string>("");
    const [userPermissionsJSON, setUserPermissionsJSON] = useState<string>("");
    const [userSettingsJSON, setUserSettingsJSON] = useState<string>("");
    const [userSessionsJSON, setUserSessionsJSON] = useState<string>("");
    const [userLoginsJSON, setUserLoginsJSON] = useState<string>("");
    const [userSubusersJSON, setUserSubusersJSON] = useState<string>("");
    const [userSalesPersonsJSON, setSalesPersonsJSON] = useState<string>("");
    const [userStatisticsJSON, setUserStatisticsJSON] = useState<string>("");

    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [username, setUsername] = useState<string>("");
    const [initialUserPermissionsJSON, setInitialUserPermissionsJSON] = useState<string>("");

    useEffect(() => {
        if (id) {
            getUserProfile(id).then((response) => {
                setProfileJson(JSON.stringify(response, null, 2));
            });
            getUserExtendedInfo(id).then((response) => {
                setExtendedInfoJSON(JSON.stringify(response, null, 2));
            });
            getUserShortInfo(id).then((response) => {
                setUsername(response?.loginname || response?.userName || response?.firstName);
                setShortInfoJSON(JSON.stringify(response, null, 2));
            });
            getUserLocations(id).then((response) => {
                setLocationsJSON(JSON.stringify(response, null, 2));
            });
            getUserPermissions(id).then((response) => {
                const stringifiedResponse = JSON.stringify(response, null, 2);
                setUserPermissionsJSON(stringifiedResponse);
                setInitialUserPermissionsJSON(stringifiedResponse);
            });
            getUserSettings(id).then((response) => {
                setUserSettingsJSON(JSON.stringify(response, null, 2));
            });
            listUserSessions(id).then((response) => {
                setUserSessionsJSON(JSON.stringify(response, null, 2));
            });
            listUserLogins(id).then((response) => {
                setUserLoginsJSON(JSON.stringify(response, null, 2));
            });
            listSubusers(id).then((response) => {
                setUserSubusersJSON(JSON.stringify(response, null, 2));
            });
            listSalesPersons(id).then((response) => {
                setSalesPersonsJSON(JSON.stringify(response, null, 2));
            });
            getUserStatistics(id).then((response) => {
                setUserStatisticsJSON(JSON.stringify(response, null, 2));
            });
        }
    }, [id]);

    const { handleShowToast } = useToast();

    const mutateJson = (jsonString: string, fieldName: string): string => {
        try {
            const jsonObject = JSON.parse(jsonString);

            if (typeof jsonObject === "object" && jsonObject !== null) {
                const fieldValue = jsonObject[fieldName];
                delete jsonObject[fieldName];

                const updatedJsonObject = { [fieldName]: fieldValue, ...jsonObject };
                return JSON.stringify(updatedJsonObject, null, 2);
            }
        } catch (err) {}

        return jsonString;
    };

    useEffect(() => {
        if (initialUserPermissionsJSON !== userPermissionsJSON) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [userPermissionsJSON, initialUserPermissionsJSON]);

    const handleChangeUserPermissions = ([fieldName, fieldValue]: [string, number]): void => {
        const parsedUserPermission = JSON.parse(userPermissionsJSON);
        parsedUserPermission[fieldName] = fieldValue;
        setUserPermissionsJSON(JSON.stringify(parsedUserPermission, null, 2));
    };

    const handleSetUserPermissions = (): void => {
        if (id) {
            setUserPermissions(id, JSON.parse(userPermissionsJSON)).then((response) => {
                try {
                    if (response.status === Status.OK) {
                        handleShowToast({
                            message: `<strong>${username}</strong> permissions successfully saved`,
                            type: "success",
                        });
                    }
                } catch (err) {
                    const { message } = err as Error | AxiosError;
                    handleShowToast({ message, type: "danger" });
                }

                try {
                    setIsButtonDisabled(true);
                    setInitialUserPermissionsJSON(userPermissionsJSON);
                } catch (error) {
                    setIsButtonDisabled(true);
                }
            });
        }
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab as UserCardTabs);
    };

    return (
        <div className='row g-5 g-xl-10 mb-5 mb-xl-10'>
            <div className='col-12 d-flex flex-lg-column'>
                <div className='col-lg-12 col-3 card card-custom mb-5'>
                    <div className='card-header'>
                        <h3 className='card-title fw-bolder text-dark'>
                            {username && `${username}'s User Card`}
                        </h3>
                    </div>
                    <div className='card-body d-flex flex-column pb-0'>
                        <ul className='nav nav-stretch nav-line-tabs flex-column flex-lg-row border-transparent fs-5 fw-bolder flex-nowrap'>
                            {userCardTabsArray.map((tab) => (
                                <TabNavigate
                                    key={tab}
                                    tab={tab}
                                    activeTab={activeTab}
                                    onTabClick={handleTabClick}
                                />
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='col-lg-12 col-9 tab-content' id='myTabPanel'>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Profile}>
                        <TabDataWrapper data={profileJson} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.ExtendedInfo}>
                        <TabDataWrapper data={extendedInfoJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.ShortInfo}>
                        <TabDataWrapper data={shortInfoJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Locations}>
                        <TabDataWrapper data={mutateJson(locationsJSON, "status")} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.UserPermissions}>
                        <TabDataWrapper
                            data={mutateJson(userPermissionsJSON, "useruid")}
                            checkbox={true}
                            action={handleChangeUserPermissions}
                        >
                            <PrimaryButton
                                icon='check'
                                disabled={isButtonDisabled}
                                buttonClickAction={handleSetUserPermissions}
                            >
                                Save {username} permissions
                            </PrimaryButton>
                        </TabDataWrapper>
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Settings}>
                        <TabDataWrapper data={mutateJson(userSettingsJSON, "status")} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Sessions}>
                        <TabDataWrapper data={userSessionsJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Logins}>
                        <TabDataWrapper data={userLoginsJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Subusers}>
                        <TabDataWrapper data={userSubusersJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.SalesPersons}>
                        <TabDataWrapper data={userSalesPersonsJSON} />
                    </TabPanel>
                    <TabPanel activeTab={activeTab} tabName={UserCardTabs.Statistics}>
                        <UserStatistics data={userStatisticsJSON} />
                    </TabPanel>
                    {id && (
                        <>
                            <TabPanel
                                activeTab={activeTab}
                                tabName={UserCardTabs.TemplatesForReports}
                            >
                                <UserTemplatesReports useruid={useruid} />
                            </TabPanel>
                            <TabPanel
                                activeTab={activeTab}
                                tabName={UserCardTabs.TemplatesForPrintedForms}
                            >
                                <UserTemplatesPrintedForm useruid={useruid} />
                            </TabPanel>
                            <TabPanel activeTab={activeTab} tabName={UserCardTabs.ApiKeys}>
                                <ApiKeys useruid={id} />
                            </TabPanel>
                            <TabPanel activeTab={activeTab} tabName={UserCardTabs.DataExport}>
                                <DataExports useruid={id} />
                            </TabPanel>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
