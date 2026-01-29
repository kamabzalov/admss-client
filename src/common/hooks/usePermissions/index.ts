import { useStore } from "store/hooks";
import { PermissionKey } from "common/constants/permissions";

export const usePermissions = () => {
    const { authUser } = useStore().userStore;

    const hasPermission = (permissionKey: PermissionKey): boolean => {
        if (!authUser || !authUser.permissions) return false;
        return authUser.permissions[permissionKey] === 1;
    };

    const hasAnyPermission = (...permissionKeys: PermissionKey[]): boolean => {
        return permissionKeys.some((key) => hasPermission(key));
    };

    const hasAllPermissions = (...permissionKeys: PermissionKey[]): boolean => {
        return permissionKeys.every((key) => hasPermission(key));
    };

    const isSalespersonOnly = (): boolean => {
        if (!authUser || !authUser.permissions) return false;

        const permissions = authUser.permissions;
        const hasSalespersonRole = permissions.uaSalesPerson === 1;

        if (!hasSalespersonRole) return false;

        const inventoryPermissions: PermissionKey[] = [
            "uaViewInventory",
            "uaAddInventory",
            "uaEditInventory",
            "uaDeleteInventory",
            "uaViewCostsAndExpenses",
            "uaAddExpenses",
            "uaEditExpenses",
            "uaSalesPerson",
        ];

        const otherPermissions = Object.keys(permissions).filter(
            (key) =>
                !inventoryPermissions.includes(key as PermissionKey) &&
                permissions[key as PermissionKey] === 1
        );

        return otherPermissions.length === 0;
    };

    const inventoryPermissions = {
        canView: (): boolean => hasPermission("uaViewInventory"),

        canCreate: (): boolean => hasPermission("uaAddInventory"),

        canEdit: (): boolean => hasPermission("uaEditInventory"),

        canDelete: (): boolean => hasPermission("uaDeleteInventory"),

        canSeeInMenu: (): boolean => {
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canViewList: (): boolean => {
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canSelectInInputs: (): boolean => {
            return (
                hasPermission("uaViewInventory") &&
                (hasPermission("uaEditInventory") || hasPermission("uaAddInventory"))
            );
        },

        canOpenDetails: (): boolean => {
            return hasPermission("uaViewInventory") && hasPermission("uaEditInventory");
        },

        canEditExpenses: (): boolean => hasPermission("uaEditExpenses"),

        canAddExpenses: (): boolean => hasPermission("uaAddExpenses"),

        canEditPayments: (): boolean => hasPermission("uaEditPayments"),

        canDeletePayments: (): boolean => hasPermission("uaDeletePayments"),

        canEditLeaseHerePayHere: (): boolean => hasPermission("uaAddCreditsAndFees"),
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSalespersonOnly,
        inventoryPermissions,
    };
};
