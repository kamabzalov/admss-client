import { Sidebar } from "dashboard/sidebar";
import { Header } from "dashboard/header";
import { Outlet, useNavigate } from "react-router-dom";
import "dashboard/index.css";
import { ReactElement, Suspense, useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "common/models/user";
import { createApiDashboardInstance } from "http/index";
import { LS_APP_USER } from "common/constants/localStorage";
import { Loader } from "dashboard/common/loader";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { RouteTracker } from "dashboard/common/route-tracker";

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
