import { Navigate, Outlet } from "react-router-dom";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";

interface UserRoles {
    admin: boolean;
    localAdmin: boolean;
    manager: boolean;
    salesPerson: boolean;
}

interface ProtectedRouteProps {
    allowedRoles: (keyof UserRoles)[];
    children?: ReactNode;
}

export const useAuth = (): AuthUser | null => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(() => getKeyValue(LS_APP_USER));

    useEffect(() => {
        const handleStorageChange = () => {
            setAuthUser(getKeyValue(LS_APP_USER));
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    return authUser;
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps): ReactElement => {
    const authUser = useAuth();
    const [hasRequiredRole, setHasRequiredRole] = useState<boolean>(true);

    useEffect(() => {
        if (authUser) {
            const userRoles: UserRoles = {
                admin: !!authUser.isadmin,
                localAdmin: !!authUser.islocaladmin,
                manager: !!authUser.ismanager,
                salesPerson: !!authUser.issalesperson,
            };

            setHasRequiredRole(
                allowedRoles.some((role) => {
                    return userRoles[role];
                })
            );
        }
    }, [allowedRoles, authUser]);

    if (!authUser) {
        return <Navigate to='/' replace />;
    }

    if (!hasRequiredRole) {
        return <Navigate to='/dashboard' replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
