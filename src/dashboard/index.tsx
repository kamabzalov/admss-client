import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Outlet, useNavigate } from "react-router-dom";
import "./index.css";
import { ReactElement, Suspense, useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "http/services/auth.service";
import { createApiDashboardInstance } from "../http/index";
import { LS_APP_USER } from "common/constants/localStorage";
import { Loader } from "./common/loader";
import { ToastProvider } from "./common/toast";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

export const Dashboard = observer((): ReactElement => {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        const storedUser: AuthUser = getKeyValue(LS_APP_USER);
        if (storedUser) {
            createApiDashboardInstance(navigate);
            setUser(storedUser);
        } else {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const store = useStore().userStore;
    const { authUser } = store;

    if (!user || !authUser) {
        return <Loader overlay />;
    }

    return (
        <ToastProvider>
            <Suspense fallback={<Loader overlay />}>
                <Header />
                <Sidebar />
                <main className='main'>
                    <div className='container'>
                        <Outlet />
                    </div>
                </main>
            </Suspense>
        </ToastProvider>
    );
});
