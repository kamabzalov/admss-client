import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
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
import { getExtendedData } from "http/services/auth-user.service";
import { HELP_PAGE } from "common/constants/links";

export const Header = observer((): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const menuRight = useRef<Menu>(null);
    const navigate = useNavigate();
    const [supportContact, setSupportContact] = useState<boolean>(false);
    const [supportHistory, setSupportHistory] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<boolean>(false);
    const [showChangeLocation, setShowChangeLocation] = useState<boolean>(false);

    const [isSalesPerson, setIsSalesPerson] = useState(true);
    useEffect(() => {
        if (authUser && Object.keys(authUser.permissions).length) {
            getExtendedData(authUser.useruid).then((response) => {
                if (response && response.locations && response.locations.length > 1) {
                    setShowChangeLocation(true);
                }
            });
            const { permissions } = authUser;
            const { uaSalesPerson, ...otherPermissions } = permissions;
            if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                return setIsSalesPerson(false);
            }
            if (!!uaSalesPerson) setIsSalesPerson(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    const signOut = ({ useruid }: AuthUser) => {
        logout(useruid).finally(() => {
            localStorageClear(LS_APP_USER);
            navigate("/");
        });
    };

    const menuItems = useMemo(
        () =>
            [
                {
                    label: "My Profile",
                    command() {
                        setUserProfile(true);
                    },
                },
                !isSalesPerson
                    ? { label: "General Settings", command: () => navigate("settings") }
                    : null,
                { separator: true },
                showChangeLocation ? { label: "Change Location" } : null,
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
            ].filter(Boolean) as MenuItem[],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [authUser, isSalesPerson, showChangeLocation]
    );

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
                            <span className='header-dealer-location'>{authUser?.locationname}</span>
                        </div>
                        <div className='header-user-menu ml-auto'>
                            <Menu model={menuItems} popup ref={menuRight} popupAlignment='right' />
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
