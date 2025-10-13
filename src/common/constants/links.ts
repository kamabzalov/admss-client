export const HELP_PAGE: string = "https://www.admss.com/";
export const CONTACT_SUPPORT: string = "contact-support";

export const DASHBOARD_PAGE: string = "/dashboard";
export const CREATE_PATH: string = "/create";

interface DealsPage {
    readonly MAIN: string;
    CREATE(): string;
    WASHOUT(id: string): string;
    EDIT(id: string): string;
}

export const DEALS_PAGE: Readonly<DealsPage> = {
    MAIN: `${DASHBOARD_PAGE}/deals`,

    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    WASHOUT(id: string) {
        return `${this.MAIN}/${id}/washout`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface InventoryPage {
    readonly MAIN: string;
    CREATE(): string;
    EDIT(id: string): string;
}
export const INVENTORY_PAGE: Readonly<InventoryPage> = {
    MAIN: `${DASHBOARD_PAGE}/inventory`,
    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface ContactsPage {
    readonly MAIN: string;
    CREATE(): string;
    EDIT(id: string): string;
}

export const CONTACTS_PAGE: Readonly<ContactsPage> = {
    MAIN: `${DASHBOARD_PAGE}/contacts`,
    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface AccountsPage {
    readonly MAIN: string;
    CREATE(): string;
    EDIT(id: string): string;
}
export const ACCOUNTS_PAGE: Readonly<AccountsPage> = {
    MAIN: `${DASHBOARD_PAGE}/accounts`,
    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface ReportsPage {
    readonly MAIN: string;
    CREATE(): string;
    EDIT(id: string): string;
}
export const REPORTS_PAGE: Readonly<ReportsPage> = {
    MAIN: `${DASHBOARD_PAGE}/reports`,
    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface ExportWebPage {
    readonly MAIN: string;
}
export const EXPORT_WEB_PAGE: Readonly<ExportWebPage> = {
    MAIN: `${DASHBOARD_PAGE}/export-web`,
};

interface TasksPage {
    readonly MAIN: string;
}
export const TASKS_PAGE: Readonly<TasksPage> = {
    MAIN: `${DASHBOARD_PAGE}/tasks`,
};

interface UsersPage {
    readonly MAIN: string;
    CREATE(): string;
    EDIT(id: string): string;
}

export const USERS_PAGE: Readonly<UsersPage> = {
    MAIN: `${DASHBOARD_PAGE}/users`,
    CREATE() {
        return `${this.MAIN}${CREATE_PATH}`;
    },
    EDIT(id: string) {
        return `${this.MAIN}/${id}`;
    },
};

interface SettingsPage {
    readonly MAIN: string;
}
export const SETTINGS_PAGE: Readonly<SettingsPage> = {
    MAIN: `${DASHBOARD_PAGE}/settings`,
};

interface SidebarPage {
    readonly HOME: string;
    readonly INVENTORY: string;
    readonly CONTACTS: string;
    readonly DEALS: string;
    readonly ACCOUNTS: string;
    readonly REPORTS: string;
    readonly EXPORT_WEB: string;
    readonly TASKS: string;
}

export const SIDEBAR_PAGE: Readonly<SidebarPage> = {
    HOME: `${DASHBOARD_PAGE}`,
    INVENTORY: INVENTORY_PAGE.MAIN,
    CONTACTS: CONTACTS_PAGE.MAIN,
    DEALS: DEALS_PAGE.MAIN,
    ACCOUNTS: ACCOUNTS_PAGE.MAIN,
    REPORTS: REPORTS_PAGE.MAIN,
    EXPORT_WEB: EXPORT_WEB_PAGE.MAIN,
    TASKS: TASKS_PAGE.MAIN,
};
