import { Router as RemixRouter } from "@remix-run/router/dist/router";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./index.css";
import { ReactElement } from "react";
import App from "App";
import { Dashboard } from "dashboard";
import { Accounts } from "dashboard/accounts";
import { AccountsForm } from "dashboard/accounts/form";
import { Contacts } from "dashboard/contacts";
import { ContactForm } from "dashboard/contacts/form";
import { Deals } from "dashboard/deals";
import { DealsForm } from "dashboard/deals/form";
import { Home } from "dashboard/home";
import Inventory from "dashboard/inventory";
import { InventoryForm } from "dashboard/inventory/form";
import { SignIn } from "sign/sign-in";
import { TwoFactorAuth } from "sign/two-factor-auth";
import ProtectedRoute from "http/routes/ProtectedRoute";
import { GeneralSettings } from "dashboard/profile/generalSettings";
import { Reports } from "dashboard/reports";
import { ExportToWeb } from "dashboard/export-web";
import { ReportForm } from "dashboard/reports/form";
import { PrintForTestDrive } from "dashboard/test-drive";
import { AccountTakePayment } from "dashboard/accounts/take-payment-form";
import { Tasks } from "dashboard/tasks";
import { ErrorBoundary } from "http/routes/ErrorBoundary";
import { AppProvider } from "common/providers/AppProvider";
import { ServiceUpdate } from "services/service-update";
import { DealWashout } from "dashboard/deals/form/washout";
import { Users } from "dashboard/profile/users";
import { UsersForm } from "dashboard/profile/users/form";
import { UsersRolesForm } from "dashboard/profile/generalSettings/roles/form";
import { UserProfile } from "dashboard/profile/userProfile";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const AppRouter = (): ReactElement => {
    const routes = [
        {
            path: "/",
            element: <App />,
            errorElement: <ErrorBoundary />,
            children: [
                { path: "", element: <SignIn /> },
                {
                    path: "2fa",
                    element: <TwoFactorAuth />,
                },
                {
                    path: "service-update",
                    element: <ServiceUpdate />,
                },
                {
                    path: "dashboard",
                    element: <Dashboard />,
                    children: [
                        {
                            path: "",
                            element: (
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            ),
                        },
                        {
                            path: "test-drive",
                            element: (
                                <ProtectedRoute>
                                    <PrintForTestDrive />
                                </ProtectedRoute>
                            ),
                        },
                        {
                            path: "inventory",
                            element: (
                                <ProtectedRoute>
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
                                <ProtectedRoute notAllowed={["salesPerson"]}>
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
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Deals /> },
                                { path: "create", element: <DealsForm /> },
                                { path: ":id", element: <DealsForm /> },
                                { path: ":id/washout", element: <DealWashout /> },
                            ],
                        },
                        {
                            path: "accounts",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Accounts /> },
                                { path: "create", element: <AccountsForm /> },
                                { path: ":id", element: <AccountsForm /> },
                                { path: ":id/take-payment", element: <AccountTakePayment /> },
                            ],
                        },
                        {
                            path: "settings",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <GeneralSettings /> },
                                { path: "roles", element: <UsersRolesForm /> },
                                { path: "roles/:id", element: <UsersRolesForm /> },
                            ],
                        },
                        {
                            path: "users",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Users /> },
                                { path: ":id", element: <UsersForm /> },
                            ],
                        },
                        {
                            path: "reports",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [
                                { path: "", element: <Reports /> },
                                { path: ":id", element: <ReportForm /> },
                                { path: "create", element: <ReportForm /> },
                            ],
                        },
                        {
                            path: "export-web",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <ExportToWeb />
                                </ProtectedRoute>
                            ),
                        },
                        {
                            path: "tasks",
                            element: (
                                <ProtectedRoute notAllowed={["salesPerson"]}>
                                    <Outlet />
                                </ProtectedRoute>
                            ),
                            children: [{ path: "", element: <Tasks /> }],
                        },
                        {
                            path: "user-profile",
                            element: (
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            ),
                        },
                    ],
                },
            ],
        },
    ];

    const router: RemixRouter = createBrowserRouter(routes);

    return (
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    );
};

root.render(<AppRouter />);
