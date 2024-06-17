import { Navigate, Outlet } from "react-router-dom";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { getUserPermissions } from "http/services/auth-user.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
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

const ProtectedRoute = observer(({ notAllowed, children }: ProtectedRouteProps): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [hasRequiredRole, setHasRequiredRole] = useState<boolean>(true);

    useEffect(() => {
        if (authUser) {
            const authUser = getKeyValue(LS_APP_USER);
            getUserPermissions(authUser.useruid).then((response) => {
                if (!response) return setHasRequiredRole(false);
                store.userPermissions = response as UserPermissionsResponse;
                const { uaSalesPerson, ...otherPermissions } = response;
                if (!!uaSalesPerson) return setHasRequiredRole(false);
                if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                    return setHasRequiredRole(true);
                } else if (!!uaSalesPerson) setHasRequiredRole(false);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!authUser) {
        return <Navigate to='/' replace />;
    }
    if (!hasRequiredRole && notAllowed) {
        return <Navigate to='/dashboard' replace />;
    }

    return children ? <>{children}</> : <Outlet />;
});

export default ProtectedRoute;
