import Sidebar from "./sidebar";
import Header from "./header";
import { Outlet, useNavigate } from "react-router-dom";
import "./index.css";
import { useEffect, useState } from "react";
import { getKeyValue } from "services/local-storage.service";
import { AuthUser } from "http/services/auth.service";
import { createApiDashboardInstance } from "../http";

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    useEffect(() => {
        const authUser: AuthUser = getKeyValue("admss-client-app-user");
        if (authUser) {
            createApiDashboardInstance();
            setUser(authUser);
        } else {
            navigate("/");
        }
    }, []);

    if (user) {
        return (
            <>
                <Header user={user} />
                <Sidebar />
                <main className='main'>
                    <div className='container'>
                        <Outlet />
                    </div>
                </main>
            </>
        );
    }
    return null;
}
