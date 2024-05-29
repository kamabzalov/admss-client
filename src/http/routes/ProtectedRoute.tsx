import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ReactElement, ReactNode, useEffect, useState, useRef } from "react";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue, localStorageClear, setKey } from "services/local-storage.service";
import { getUserPermissions } from "http/services/auth-user.service";

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

let isFetching = false;

const updatePermissions = async (
    authUser: AuthUser | null,
    setAuthUser: (user: AuthUser) => void,
    lastUpdateRef: React.MutableRefObject<number>
) => {
    if (authUser && !isFetching) {
        const now = Date.now();
        if (now - lastUpdateRef.current < 3000) return;

        isFetching = true;
        lastUpdateRef.current = now;

        try {
            const permissions = await getUserPermissions(authUser.useruid);
            const { uaSystemAdmin, uaLocationAdmin, uaManager, uaSalesPerson } = permissions;

            const user: AuthUser = getKeyValue(LS_APP_USER);

            user.islocaladmin = uaLocationAdmin || 0;
            authUser.islocaladmin = uaLocationAdmin || 0;
            user.isadmin = uaSystemAdmin || 0;
            authUser.isadmin = uaSystemAdmin || 0;
            user.ismanager = uaManager || 0;
            authUser.ismanager = uaManager || 0;
            user.issalesperson = uaSalesPerson || 0;
            authUser.issalesperson = uaSalesPerson || 0;

            localStorageClear(LS_APP_USER);
            setKey(LS_APP_USER, JSON.stringify(user));
            setAuthUser(user);
        } finally {
            isFetching = false;
        }
    }
};

export const useAuth = (): AuthUser | null => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(() => getKeyValue(LS_APP_USER));
    const location = useLocation();
    const lastUpdateRef = useRef<number>(0);

    useEffect(() => {
        const handleStorageChange = () => {
            setAuthUser(getKeyValue(LS_APP_USER));
            updatePermissions(authUser, setAuthUser, lastUpdateRef);
        };

        updatePermissions(authUser, setAuthUser, lastUpdateRef);
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
            const { isadmin, issalesperson, ismanager, islocaladmin } = authUser;
            const userRoles: UserRoles = {
                admin: !!isadmin,
                localAdmin: !!islocaladmin,
                manager: !!ismanager,
                salesPerson: !!issalesperson,
            };

            if ([isadmin, islocaladmin, ismanager].some(Boolean)) {
                return setHasRequiredRole(true);
            }

            if (notAllowed) {
                setHasRequiredRole(notAllowed.some((role) => !userRoles[role]));
            }
        }
    }, [authUser, notAllowed]);

    if (!authUser) {
        return <Navigate to='/' replace />;
    }

    if (!hasRequiredRole) {
        return <Navigate to='/dashboard' replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
