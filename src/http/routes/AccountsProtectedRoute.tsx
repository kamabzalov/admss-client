import { Navigate, useParams } from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { usePermissions } from "common/hooks";
import { ACCOUNTS_PAGE, DASHBOARD_PAGE } from "common/constants/links";

interface AccountsProtectedRouteProps {
    children: ReactNode;
    requireEditPayments?: boolean;
}

export const AccountsProtectedRoute = ({
    children,
    requireEditPayments,
}: AccountsProtectedRouteProps): ReactElement => {
    const { accountPermissions } = usePermissions();
    const { id } = useParams();

    if (!accountPermissions.canView()) {
        return <Navigate to={DASHBOARD_PAGE} replace />;
    }

    if (requireEditPayments && !accountPermissions.canEditPayments()) {
        return <Navigate to={id ? ACCOUNTS_PAGE.EDIT(id) : ACCOUNTS_PAGE.MAIN} replace />;
    }

    return <>{children}</>;
};
