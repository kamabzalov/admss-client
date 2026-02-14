import { Navigate } from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { usePermissions } from "common/hooks";
import { CONTACTS_PAGE } from "common/constants/links";

interface ContactsProtectedRouteProps {
    children: ReactNode;
    requireCreate?: boolean;
    requireEdit?: boolean;
}

export const ContactsProtectedRoute = ({
    children,
    requireCreate,
    requireEdit,
}: ContactsProtectedRouteProps): ReactElement => {
    const { contactPermissions } = usePermissions();

    if (!contactPermissions.canView()) {
        return <Navigate to='/dashboard' replace />;
    }

    if (requireCreate && !contactPermissions.canCreate()) {
        return <Navigate to={CONTACTS_PAGE.MAIN} replace />;
    }

    if (requireEdit && !contactPermissions.canOpenDetails()) {
        return <Navigate to={CONTACTS_PAGE.MAIN} replace />;
    }

    return <>{children}</>;
};
