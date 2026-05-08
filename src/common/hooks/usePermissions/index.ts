import { useStore } from "store/hooks";
import { PermissionKey } from "common/constants/permissions";
import { fromBinary } from "common/helpers";

const SALESPERSON_ALLOWED_PERMISSIONS: ReadonlyArray<PermissionKey> = [
    "uaViewInventory",
    "uaAddInventory",
    "uaEditInventory",
    "uaDeleteInventory",
    "uaViewCostsAndExpenses",
    "uaAddExpenses",
    "uaEditExpenses",
    "uaSalesPerson",
];

export const usePermissions = () => {
    const { authUser } = useStore().userStore;

    const isSalesperson = (): boolean => {
        if (!authUser) return false;
        if (fromBinary(authUser.issalesperson)) return true;
        return fromBinary(authUser.permissions?.uaSalesPerson);
    };

    const hasPermission = (permissionKey: PermissionKey): boolean => {
        if (!authUser || !authUser.permissions) return false;
        if (isSalesperson() && !SALESPERSON_ALLOWED_PERMISSIONS.includes(permissionKey)) {
            return false;
        }
        return fromBinary(authUser.permissions[permissionKey]);
    };

    const hasAnyPermission = (...permissionKeys: PermissionKey[]): boolean => {
        return permissionKeys.some((key) => hasPermission(key));
    };

    const hasAllPermissions = (...permissionKeys: PermissionKey[]): boolean => {
        return permissionKeys.every((key) => hasPermission(key));
    };

    const isSalespersonOnly = (): boolean => {
        if (!authUser || !authUser.permissions) return false;
        if (!isSalesperson()) return false;

        const permissions = authUser.permissions;
        const otherPermissions = Object.keys(permissions).filter(
            (key) =>
                !SALESPERSON_ALLOWED_PERMISSIONS.includes(key as PermissionKey) &&
                fromBinary(permissions[key as PermissionKey])
        );

        return otherPermissions.length === 0;
    };

    const inventoryPermissions = {
        canView: (): boolean => {
            if (isSalesperson()) return true;
            return hasPermission("uaViewInventory");
        },

        canCreate: (): boolean => hasPermission("uaAddInventory"),

        canEdit: (): boolean => {
            if (isSalesperson()) return true;
            return hasPermission("uaEditInventory");
        },

        canDelete: (): boolean => hasPermission("uaDeleteInventory"),

        canSeeInMenu: (): boolean => {
            if (isSalesperson()) return true;
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canViewList: (): boolean => {
            if (isSalesperson()) return true;
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canSelectInInputs: (): boolean => {
            if (isSalesperson()) return true;
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canOpenDetails: (): boolean => {
            if (isSalesperson()) return true;
            return hasPermission("uaViewInventory") && hasPermission("uaEditInventory");
        },

        canEditExpenses: (): boolean => hasPermission("uaEditExpenses"),

        canAddExpenses: (): boolean => hasPermission("uaAddExpenses"),

        canEditPayments: (): boolean => hasPermission("uaEditPayments"),

        canDeletePayments: (): boolean => hasPermission("uaDeletePayments"),

        canEditLeaseHerePayHere: (): boolean => hasPermission("uaAddCreditsAndFees"),
    };

    const contactPermissions = {
        canView: (): boolean => hasPermission("uaViewContacts"),

        canCreate: (): boolean => hasPermission("uaAddContacts"),

        canEdit: (): boolean => hasPermission("uaEditContacts"),

        canDelete: (): boolean => hasPermission("uaDeleteContacts"),

        canSeeInMenu: (): boolean => {
            return (
                hasPermission("uaViewContacts") &&
                (hasPermission("uaEditContacts") || hasPermission("uaAddContacts"))
            );
        },

        canViewList: (): boolean => {
            return (
                hasPermission("uaViewContacts") &&
                (hasPermission("uaEditContacts") || hasPermission("uaAddContacts"))
            );
        },

        canSelectInInputs: (): boolean => {
            return (
                hasPermission("uaViewContacts") &&
                (hasPermission("uaEditContacts") || hasPermission("uaAddContacts"))
            );
        },

        canOpenDetails: (): boolean => {
            return hasPermission("uaViewContacts") && hasPermission("uaEditContacts");
        },
    };

    const dealPermissions = {
        canView: (): boolean => hasPermission("uaViewDeals"),

        canCreate: (): boolean => hasPermission("uaAddDeals"),

        canEdit: (): boolean => hasPermission("uaEditDeals"),

        canDelete: (): boolean => hasPermission("uaDeleteDeal"),

        canPrintForms: (): boolean => hasPermission("uaPrintDealsForms"),

        canEditWashout: (): boolean => hasPermission("uaEditDealWashout"),

        canUsePaymentCalculator: (): boolean => hasPermission("uaAllowPaymentCalculator"),

        canUsePaymentQuote: (): boolean => hasPermission("uaAllowPaymentQuote"),

        canSeeInMenu: (): boolean => {
            return (
                hasPermission("uaViewDeals") &&
                (hasPermission("uaEditDeals") || hasPermission("uaAddDeals"))
            );
        },

        canViewList: (): boolean => {
            return (
                hasPermission("uaViewDeals") &&
                (hasPermission("uaEditDeals") || hasPermission("uaAddDeals"))
            );
        },

        canSelectInInputs: (): boolean => {
            return (
                hasPermission("uaViewDeals") &&
                (hasPermission("uaEditDeals") || hasPermission("uaAddDeals"))
            );
        },

        canOpenDetails: (): boolean => {
            return hasPermission("uaViewDeals") && hasPermission("uaEditDeals");
        },
    };

    const accountPermissions = {
        canView: (): boolean => hasPermission("uaViewAccounts"),

        canEdit: (): boolean => hasPermission("uaEditAccounts"),

        canDelete: (): boolean => hasPermission("uaDeleteAccounts"),

        canSeeInMenu: (): boolean => hasPermission("uaViewAccounts"),

        canOpenDetails: (): boolean => hasPermission("uaViewAccounts"),

        canEditPayments: (): boolean => hasPermission("uaEditPayments"),

        canBackPayments: (): boolean => hasPermission("uaAllowBackDatingPayments"),

        canEditPartialPayments: (): boolean => hasPermission("uaAllowPartialPayments"),
    };

    const salesPermissions = {
        canShowContacts: (): boolean => !isSalesperson(),

        canShowDeals: (): boolean => !isSalesperson(),

        canShowAccounts: (): boolean => !isSalesperson(),

        canShowReports: (): boolean => !isSalesperson(),

        canShowTasks: (): boolean => !isSalesperson(),

        canShowExportWeb: (): boolean => !isSalesperson(),

        shouldShowManagerMenu: (): boolean => !isSalesperson(),
    };

    const canAccessSettings = (): boolean => {
        if (isSalesperson()) return false;
        return hasPermission("uaEditSettings");
    };

    const canAccessUsers = (): boolean => {
        if (isSalesperson()) return false;
        return hasPermission("uaCreateUsers");
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSalesperson,
        isSalespersonOnly,
        canAccessSettings,
        canAccessUsers,
        inventoryPermissions,
        contactPermissions,
        dealPermissions,
        accountPermissions,
        salesPermissions,
    };
};
