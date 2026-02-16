import { Navigate } from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { usePermissions } from "common/hooks";
import { DASHBOARD_PAGE } from "common/constants/links";

interface InventoryProtectedRouteProps {
    children: ReactNode;
    requireCreate?: boolean;
    requireEdit?: boolean;
}

export const InventoryProtectedRoute = ({
    children,
    requireCreate,
    requireEdit,
}: InventoryProtectedRouteProps): ReactElement => {
    const { inventoryPermissions } = usePermissions();

    if (!inventoryPermissions.canView()) {
        return <Navigate to={DASHBOARD_PAGE} replace />;
    }

    if (requireCreate && !inventoryPermissions.canCreate()) {
        return <Navigate to='/dashboard/inventory' replace />;
    }

    if (requireEdit && !inventoryPermissions.canOpenDetails()) {
        return <Navigate to='/dashboard/inventory' replace />;
    }

    return <>{children}</>;
};
