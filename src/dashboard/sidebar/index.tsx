import { Link } from "react-router-dom";
import "./index.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-nav__item">
          <Link to="/dashboard" className="sidebar-nav__link">
            <span>Dashboard</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/inventory" className="sidebar-nav__link">
            <span>Inventory</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/contacts" className="sidebar-nav__link">
            <span>Contacts</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/deals" className="sidebar-nav__link">
            <span>Deals</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/accounts" className="sidebar-nav__link">
            <span>Accounts</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/reports" className="sidebar-nav__link">
            <span>Reports</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
