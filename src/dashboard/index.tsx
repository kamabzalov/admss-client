import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Outlet, useNavigate } from "react-router-dom";
import "./index.css";
import { Suspense, useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "http/services/auth.service";
import { createApiDashboardInstance } from "../http/index";
import { LS_APP_USER } from "common/constants/localStorage";
import { Loader } from "./common/loader";
import { ToastProvider } from "./common/toast";
import { useAuth } from "http/routes/ProtectedRoute";

export default function Dashboard() {
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

    const authUser = useAuth();

    if (!user || !authUser) {
        return <Loader overlay />;
    }

    return (
        <ToastProvider>
            <Header authUser={authUser} />
            <Sidebar authUser={authUser} />
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
