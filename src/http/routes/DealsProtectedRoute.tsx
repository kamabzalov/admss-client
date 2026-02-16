import { Navigate } from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { usePermissions } from "common/hooks";
import { DASHBOARD_PAGE, DEALS_PAGE } from "common/constants/links";

interface DealsProtectedRouteProps {
    children: ReactNode;
    requireCreate?: boolean;
    requireEdit?: boolean;
    requirePrintForms?: boolean;
}

export const DealsProtectedRoute = ({
    children,
    requireCreate,
    requireEdit,
    requirePrintForms,
}: DealsProtectedRouteProps): ReactElement => {
    const { dealPermissions } = usePermissions();

    if (!dealPermissions.canView()) {
        return <Navigate to={DASHBOARD_PAGE} replace />;
    }

    if (requireCreate && !dealPermissions.canCreate()) {
        return <Navigate to={DEALS_PAGE.MAIN} replace />;
    }

    if (requireEdit && !dealPermissions.canOpenDetails()) {
        return <Navigate to={DEALS_PAGE.MAIN} replace />;
    }

    if (requirePrintForms && !dealPermissions.canPrintForms()) {
        return <Navigate to={DEALS_PAGE.MAIN} replace />;
    }

    return <>{children}</>;
};
