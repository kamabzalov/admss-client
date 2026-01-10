import { Sidebar } from "dashboard/sidebar";
import { Header } from "dashboard/header";
import { Outlet, useNavigate } from "react-router-dom";
import "dashboard/index.css";
import { ReactElement, Suspense, useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "common/models/user";
import { checkToken } from "http/services/auth.service";
import { createApiDashboardInstance } from "http/index";
import { LS_APP_USER, LS_LAST_ROUTE, LastRouteData } from "common/constants/localStorage";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { RouteTracker } from "dashboard/common/route-tracker";
import { Status } from "common/models/base-response";
import { HOME_PAGE } from "common/constants/links";

export const Dashboard = observer((): ReactElement => {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);

    const store = useStore().userStore;
    const { authUser, settings, isSettingsLoaded } = store;

    useEffect(() => {
        const storedUser: AuthUser = getKeyValue(LS_APP_USER);
        if (storedUser) {
            createApiDashboardInstance(navigate);
            if (!store.storedUser || store.storedUser.useruid !== storedUser.useruid) {
                store.storedUser = storedUser;
            }
            if (!user || user.useruid !== storedUser.useruid) {
                setUser(storedUser);
            }
        } else {
            if (authUser) {
                store.storedUser = null;
            }
            navigate("/");
        }
    }, [navigate, store]);

    useEffect(() => {
        if (authUser && (!user || user.useruid !== authUser.useruid)) {
            setUser(authUser);
        }
    }, [authUser]);

    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden) {
                const storedUser: AuthUser | null = getKeyValue(LS_APP_USER);
                if (storedUser && storedUser.token) {
                    const response = await checkToken(storedUser.token);
                    if (!response || response.status !== Status.OK) {
                        const currentPath = window.location.pathname + window.location.search;
                        const useruuid = storedUser.useruid;
                        store.clearStoredUser();
                        if (currentPath !== HOME_PAGE) {
                            const routeData: LastRouteData = {
                                path: currentPath,
                                timestamp: Date.now(),
                                useruid: useruuid,
                            };
                            localStorage.setItem(LS_LAST_ROUTE, JSON.stringify(routeData));
                        }
                        navigate("/");
                    }
                } else {
                    store.clearStoredUser();
                    navigate("/");
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [navigate, store]);

    if (!user || !authUser) {
        return <Loader overlay />;
    }

    return (
        <Suspense fallback={<Loader overlay />}>
            <RouteTracker />
            <Header />
            <Sidebar />
            {!settings.isSidebarCollapsed && <div className='sidebar-overlay'></div>}
            {isSettingsLoaded ? (
                <main className='main'>
                    <div className='container'>
                        <Outlet />
                    </div>
                </main>
            ) : (
                <></>
            )}
        </Suspense>
    );
});
