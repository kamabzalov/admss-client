import Sidebar from "./sidebar";
import Header from "./header";
import { Outlet, useNavigate } from "react-router-dom";
import "./index.css";
import { Suspense, useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "http/services/auth.service";
import { createApiDashboardInstance } from "../http/index";
import { LS_APP_USER } from "common/constants/localStorage";
import { Loader } from "./common/loader";
import { ToastProvider } from "./common/toast";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            createApiDashboardInstance(navigate);
            setUser(authUser);
        } else {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (user) {
        return (
            <ToastProvider>
                <Header user={user} />
                <Sidebar />
                <main className='main'>
                    <div className='container'>
                        <Suspense fallback={<Loader overlay />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>
            </ToastProvider>
        );
    }
    return null;
}
