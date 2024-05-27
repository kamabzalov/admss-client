import App from "App";
import Dashboard from "dashboard";
import Home from "dashboard/home";
import Inventory from "dashboard/inventory";
import { InventoryForm } from "dashboard/inventory/form";
import { GeneralSettings } from "dashboard/profile/generalSettings";
import NotFound from "not-found";
import SignIn from "sign/sign-in";

export const salespersonRoutes = [
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
                    { path: "settings", element: <GeneralSettings /> },
                ],
            },
        ],
    },
];
