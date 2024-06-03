import { Navigate, Outlet } from "react-router-dom";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";

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

const ProtectedRoute = observer(({ notAllowed, children }: ProtectedRouteProps): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [hasRequiredRole, setHasRequiredRole] = useState<boolean>(true);

    useEffect(() => {
        if (authUser) {
            const { permissions } = authUser;
            if (!permissions) return setHasRequiredRole(false);

            const { uaSalesPerson, ...otherPermissions } = permissions;
            if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                return setHasRequiredRole(true);
            } else if (!!uaSalesPerson) setHasRequiredRole(false);
        }
    }, [authUser]);

    if (!authUser) {
        return <Navigate to='/' replace />;
    }
    if (!hasRequiredRole && notAllowed) {
        return <Navigate to='/dashboard' replace />;
    }

    return children ? <>{children}</> : <Outlet />;
});

export default ProtectedRoute;
