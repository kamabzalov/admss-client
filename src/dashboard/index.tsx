import Sidebar from './sidebar';
import Header from './header';
import { Outlet } from 'react-router-dom';

export default function Dashboard() {
    return (
        <>
            <Header />
            <Sidebar />
            <main id="main" className="main">
                <Outlet />
            </main>
        </>
    );
}
