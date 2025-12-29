import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LS_LAST_ROUTE, LastRouteData } from "common/constants/localStorage";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "common/models/user";

export const RouteTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const authUser: AuthUser | null = getKeyValue(LS_APP_USER);
        if (authUser) {
            const { useruid } = authUser;
            const currentPath = location.pathname + location.search;
            const routeData: LastRouteData = {
                path: currentPath,
                timestamp: Date.now(),
                useruid,
            };
            localStorage.setItem(LS_LAST_ROUTE, JSON.stringify(routeData));
        }
    }, [location.pathname, location.search]);

    return null;
};
