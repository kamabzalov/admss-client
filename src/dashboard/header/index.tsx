import { useEffect, useRef, useState } from "react";
import "./index.css";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import logo from "assets/images/logo.svg";
import userCabinet from "assets/images/icons/header/user-cabinet.svg";
import { AuthUser, logout } from "http/services/auth.service";
import { useNavigate } from "react-router-dom";
import { getExtendedData } from "http/services/auth-user.service";
import { localStorageClear } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { SupportContactDialog } from "dashboard/profile/supportContact";
import { SupportHistoryDialog } from "dashboard/profile/supportHistory";
import { UserProfileDialog } from "dashboard/profile/userProfile";
import { GeneralSettingsDialog } from "dashboard/profile/generalSettings";

export interface HeaderProps {
    user: AuthUser;
}

export default function Header(props: HeaderProps) {
    const menuRight = useRef<Menu>(null);
    const navigate = useNavigate();
    const [dealerName, setDealerName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [supportContact, setSupportContact] = useState<boolean>(false);
    const [supportHistory, setSupportHistory] = useState<boolean>(false);
    const [generalSettings, setGeneralSettings] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<boolean>(false);

    useEffect(() => {
        getExtendedData(props.user.useruid).then((response) => {
            if (response) {
                setDealerName(response.dealerName);
                setLocation(response.location);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        {
            label: "General Settings",
            command() {
                setGeneralSettings(true);
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
                props.user && signOut(props.user);
            },
        },
    ];
    if (menuRight) {
        return (
            <header className='header'>
                <div className='flex h-full align-items-center'>
                    <div className='header__logo'>
                        <img src={logo} alt='ADMSS' />
                    </div>
                    <div className='grid m-0 head-container  justify-content-between'>
                        <div className='header-dealer-info'>
                            <p className='header-dealer-info__name font-bold'>{dealerName}</p>
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
                <UserProfileDialog
                    onHide={() => setUserProfile(false)}
                    visible={userProfile}
                    authUser={props.user}
                />
                <GeneralSettingsDialog
                    onHide={() => setGeneralSettings(false)}
                    visible={generalSettings}
                />
                <SupportContactDialog
                    onHide={() => setSupportContact(false)}
                    visible={supportContact}
                />
                <SupportHistoryDialog
                    onHide={() => setSupportHistory(false)}
                    useruid={props.user.useruid}
                    visible={supportHistory}
                />
            </header>
        );
    }
    return null;
}
