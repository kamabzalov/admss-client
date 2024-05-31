import { Router as RemixRouter } from "@remix-run/router/dist/router";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "App";
import Dashboard from "dashboard";
import NotFound from "not-found";
import Home from "./dashboard/home";
import Inventory from "./dashboard/inventory";
import SignIn from "./sign/sign-in";
import Contacts from "./dashboard/contacts";
import Deals from "dashboard/deals";
import Accounts from "dashboard/accounts";
import Reports from "dashboard/reports";
import { InventoryForm } from "dashboard/inventory/form";
import { ContactForm } from "dashboard/contacts/form";
import { ExportToWeb } from "dashboard/export-web";
import { DealsForm } from "dashboard/deals/form";
import { AccountsForm } from "dashboard/accounts/form";
import { GeneralSettings } from "dashboard/profile/generalSettings";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const router: RemixRouter = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        errorElement: <NotFound />,
        children: [
            {
                path: "",
                element: <SignIn />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
                children: [
                    {
                        path: "",
                        element: <Home />,
                    },
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
                    {
                        path: "settings",
                        element: <GeneralSettings />,
                    },
                    {
                        path: "reports",
                        element: <Reports />,
                    },
                    {
                        path: "export-web",
                        element: <ExportToWeb />,
                    },
                ],
            },
        ],
    },
]);

root.render(<RouterProvider router={router} />);
