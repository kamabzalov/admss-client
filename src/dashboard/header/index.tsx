import { ReactElement, useEffect, useRef, useState } from "react";
import "./index.css";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import logo from "assets/images/logo.svg";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import { AuthUser, logout } from "http/services/auth.service";
import { useNavigate } from "react-router-dom";
import { localStorageClear } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { SupportContactDialog } from "dashboard/profile/supportContact";
import { SupportHistoryDialog } from "dashboard/profile/supportHistory";
import { UserProfileDialog } from "dashboard/profile/userProfile";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { getExtendedData, getUserSettings } from "http/services/auth-user.service";
import { ServerUserSettings } from "common/models/user";

const DEFAULT_LOCATION = "Default";

export const Header = observer((): ReactElement => {
    const store = useStore().userStore;
    const inventoryStore = useStore().inventoryStore;
    const { authUser } = store;
    const { currentLocation } = inventoryStore;
    const menuRight = useRef<Menu>(null);
    const navigate = useNavigate();
    const [supportContact, setSupportContact] = useState<boolean>(false);
    const [supportHistory, setSupportHistory] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<boolean>(false);
    const [location, setLocation] = useState<string | null>(null);

    const [isSalesPerson, setIsSalesPerson] = useState(true);
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

    useEffect(() => {
        if (authUser) {
            if (!currentLocation) {
                getUserSettings(authUser.useruid).then((response) => {
                    if (response?.profile.length) {
                        if (response.profile) {
                            try {
                                const parsedSettings = JSON.parse(
                                    response.profile
                                ) as ServerUserSettings;
                                inventoryStore.currentLocation =
                                    parsedSettings.inventory.currentLocation || DEFAULT_LOCATION;
                            } catch (error) {
                                inventoryStore.currentLocation = DEFAULT_LOCATION;
                            }
                        }
                    }
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (authUser && currentLocation) {
            getExtendedData(authUser.useruid).then((response) => {
                if (response) {
                    const currentLocationName = response.locations.find(
                        (location) => location.locationuid === currentLocation
                    );
                    setLocation(currentLocationName?.locName || null);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentLocation]);

    const signOut = ({ useruid }: AuthUser) => {
        logout(useruid).finally(() => {
            localStorageClear(LS_APP_USER);
            navigate("/");
        });
    };

    const items: MenuItem[] = [
        {
            label: "My Profile",
            command() {
                setUserProfile(true);
            },
        },
        { separator: true },
        { label: "Change location" },
        { label: "Users" },
        { separator: true },
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
        { label: "Help" },
        { separator: true },
        {
            label: "Logout",
            command() {
                authUser && signOut(authUser);
            },
        },
    ];

    if (authUser && !isSalesPerson) {
        items.splice(1, 0, {
            label: "General Settings",
            command() {
                navigate("settings");
            },
        });
    }

    if (menuRight) {
        return (
            <header className='header'>
                <div className='flex h-full align-items-center'>
                    <div className='header__logo'>
                        <img src={logo} alt='ADMSS' />
                    </div>
                    <div className='grid m-0 head-container justify-content-between'>
                        <div className='header-dealer-info'>
                            <p className='header-dealer-info__name font-bold'>
                                {authUser?.loginname}
                            </p>
                            <span className='header-dealer-location'>{location}</span>
                        </div>
                        <div className='header-user-menu ml-auto'>
                            <Menu model={items} popup ref={menuRight} popupAlignment='right' />
                            <img
                                className='header-user-menu__toggle'
                                onClick={(event) => menuRight?.current?.toggle(event)}
                                src={userCabinet}
                                alt='User cabinet'
                            />
                        </div>
                    </div>
                </div>
                {authUser && (
                    <>
                        <UserProfileDialog
                            onHide={() => setUserProfile(false)}
                            visible={userProfile}
                            authUser={authUser}
                        />
                        <SupportContactDialog
                            onHide={() => setSupportContact(false)}
                            visible={supportContact}
                        />
                        <SupportHistoryDialog
                            onHide={() => setSupportHistory(false)}
                            useruid={authUser.useruid}
                            visible={supportHistory}
                        />
                    </>
                )}
            </header>
        );
    }
    return <></>;
});
