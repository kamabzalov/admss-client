import App from "App";
import Dashboard from "dashboard";
import Accounts from "dashboard/accounts";
import { AccountsForm } from "dashboard/accounts/form";
import Contacts from "dashboard/contacts";
import { ContactForm } from "dashboard/contacts/form";
import Deals from "dashboard/deals";
import { DealsForm } from "dashboard/deals/form";
import { ExportToWeb } from "dashboard/export-web";
import Home from "dashboard/home";
import Inventory from "dashboard/inventory";
import { InventoryForm } from "dashboard/inventory/form";
import { GeneralSettings } from "dashboard/profile/generalSettings";
import Reports from "dashboard/reports";
import NotFound from "not-found";
import SignIn from "sign/sign-in";

export const adminRoutes = [
    {
        path: "/",
        element: <App />,
        errorElement: <NotFound />,
        children: [
            { path: "", element: <SignIn /> },
            {
                path: "/dashboard",
                element: <Dashboard />,
                children: [
                    { path: "", element: <Home /> },
                    {
                        path: "inventory",
                        children: [
                            { path: "", element: <Inventory /> },
                            { path: "create", element: <InventoryForm /> },
                            { path: ":id", element: <InventoryForm /> },
                        ],
                    },
                    {
                        path: "contacts",
                        children: [
                            { path: "", element: <Contacts /> },
                            { path: "create", element: <ContactForm /> },
                            { path: ":id", element: <ContactForm /> },
                        ],
                    },
                    {
                        path: "deals",
                        children: [
                            { path: "", element: <Deals /> },
                            { path: "create", element: <DealsForm /> },
                            { path: ":id", element: <DealsForm /> },
                        ],
                    },
                    {
                        path: "accounts",
                        children: [
                            { path: "", element: <Accounts /> },
                            { path: "create", element: <AccountsForm /> },
                            { path: ":id", element: <AccountsForm /> },
                        ],
                    },
                    { path: "settings", element: <GeneralSettings /> },
                    { path: "reports", element: <Reports /> },
                    { path: "export-web", element: <ExportToWeb /> },
                ],
            },
        ],
    },
];
