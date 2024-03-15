import { Outlet } from "react-router-dom";
import { store } from "store";
import { StoreContext } from "store/context";
import { useNavigate } from "react-router-dom";
import { createApiDashboardInstance } from "http/index";

export default function App() {
    const navigate = useNavigate();

    createApiDashboardInstance(navigate);
    return (
        <StoreContext.Provider value={store}>
            <Outlet />
        </StoreContext.Provider>
    );
}
