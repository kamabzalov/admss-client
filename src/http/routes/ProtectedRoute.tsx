import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { getUserPermissions } from "http/services/auth-user.service";
import { UserPermissionsResponse } from "common/models/user";

interface UserRoles {
    admin: boolean;
    localAdmin: boolean;
    manager: boolean;
    salesPerson: boolean;
}

interface ProtectedRouteProps {
    notAllowed?: (keyof UserRoles)[];
    children?: ReactNode;
}

export const useAuth = (): AuthUser | null => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(() => getKeyValue(LS_APP_USER));
    const location = useLocation();

    useEffect(() => {
        const handleStorageChange = () => {
            setAuthUser(getKeyValue(LS_APP_USER));
        };

        if (authUser) {
            getUserPermissions(authUser.useruid).then((response) => {
                authUser.permissions = response as UserPermissionsResponse;

                return authUser;
            });
        }
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    return authUser;
};

const ProtectedRoute = ({ notAllowed, children }: ProtectedRouteProps): ReactElement => {
    const authUser = useAuth();
    const [hasRequiredRole, setHasRequiredRole] = useState<boolean>(true);

    useEffect(() => {
        if (authUser) {
            const { permissions } = authUser;
            const { uaSalesPerson, ...otherPermissions } = permissions;
            if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                return setHasRequiredRole(false);
            }
            if (!!uaSalesPerson) setHasRequiredRole(true);
        }
    }, [authUser, notAllowed, authUser?.permissions]);

    if (!authUser) {
        return <Navigate to='/' replace />;
    }

    if (!hasRequiredRole) {
        return <Navigate to='/dashboard' replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
