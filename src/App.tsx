import { Outlet } from "react-router-dom";
import { store } from "store";
import { StoreContext } from "store/context";

export default function App() {
    return (
        <StoreContext.Provider value={store}>
            <Outlet />
        </StoreContext.Provider>
    );
}
