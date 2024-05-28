import { Router as RemixRouter } from "@remix-run/router/dist/router";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./index.css";
import { ReactElement } from "react";
import App from "App";
import Dashboard from "dashboard";
import Accounts from "dashboard/accounts";
import { AccountsForm } from "dashboard/accounts/form";
import Contacts from "dashboard/contacts";
import { ContactForm } from "dashboard/contacts/form";
import Deals from "dashboard/deals";
import { DealsForm } from "dashboard/deals/form";
import Home from "dashboard/home";
import Inventory from "dashboard/inventory";
import { InventoryForm } from "dashboard/inventory/form";
import NotFound from "not-found";
import SignIn from "sign/sign-in";
import ProtectedRoute from "http/routes/ProtectedRoute";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const AppRouter = (): ReactElement => {
    const routes = [
        {
            path: "/",
            element: <App />,
            errorElement: <NotFound />,
            children: [
                { path: "", element: <SignIn /> },
                {
                    path: "dashboard",
                    element: (
                        <ProtectedRoute allowedRoles={["admin", "salesPerson"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    ),
                    children: [
                        { path: "", element: <Home /> },
                        {
                            path: "inventory",
                            element: (
                                <ProtectedRoute allowedRoles={["admin", "salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Inventory /> },
                                { path: "create", element: <InventoryForm /> },
                                { path: ":id", element: <InventoryForm /> },
                            ],
                        },
                        {
                            path: "contacts",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Contacts /> },
                                { path: "create", element: <ContactForm /> },
                                { path: ":id", element: <ContactForm /> },
                            ],
                        },
                        {
                            path: "deals",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Deals /> },
                                { path: "create", element: <DealsForm /> },
                                { path: ":id", element: <DealsForm /> },
                            ],
                        },
                        {
                            path: "accounts",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Accounts /> },
                                { path: "create", element: <AccountsForm /> },
                                { path: ":id", element: <AccountsForm /> },
                            ],
                        },
                        {
                            path: "settings",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                        },
                        {
                            path: "reports",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                        },
                        {
                            path: "export-web",
                            element: (
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                        },
                    ],
                },
            ],
        },
    ];

    const router: RemixRouter = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
};

root.render(<AppRouter />);
