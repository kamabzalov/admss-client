import { Router as RemixRouter } from "@remix-run/router/dist/router";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import { AuthUser } from "http/services/auth.service";
import { LS_APP_USER } from "common/constants/localStorage";
import { getKeyValue } from "services/local-storage.service";
import { salespersonRoutes } from "http/routes/salesperson";
import { adminRoutes } from "http/routes/admin";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const AppRouter = (): ReactElement => {
    const [isSalesPerson, setIsSalesPerson] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setIsSalesPerson(!!authUser?.issalesperson);
        }
    }, []);

    const routes = isSalesPerson ? salespersonRoutes : adminRoutes;

    const router: RemixRouter = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
};

root.render(<AppRouter />);
