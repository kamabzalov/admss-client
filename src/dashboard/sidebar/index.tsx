import { Link } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <ul className="sidebar-nav">
                <li className="nav-item">
                    <Link to="/dashboard" className="nav-link collapsed">
                        <i className="bi bi-house-fill"></i>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/dashboard/inventory" className="nav-link collapsed">
                        <i className="bi bi-car-front"></i>
                        <span>Inventory</span>
                    </Link>
                    <Link to="/dashboard/contacts" className="nav-link collapsed">
                        <i className="bi bi-envelope"></i>
                        <span>Contacts</span>
                    </Link>
                    <Link to="/dashboard/deals" className="nav-link collapsed">
                        <i className="bi bi-calculator-fill"></i>
                        <span>Deals</span>
                    </Link>
                    <Link to="/dashboard/accounts" className="nav-link collapsed">
                        <i className="bi bi-people-fill"></i>
                        <span>Accounts</span>
                    </Link>
                    <Link to="/dashboard/reports" className="nav-link collapsed">
                        <i className="bi bi-bar-chart-fill"></i>
                        <span>Reports</span>
                    </Link>
                </li>
            </ul>
        </aside>
    );
}
