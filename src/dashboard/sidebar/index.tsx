import { Link } from "react-router-dom";
import "./index.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <ul className="sidebar-nav">
        <li className="sidebar-nav__item">
          <Link to="/dashboard" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-home"></i>
            <span>Home</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/inventory" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-inventory"></i>
            <span>Inventory</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/contacts" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-contacts"></i>
            <span>Contacts</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/deals" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-deals"></i>
            <span>Deals</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/accounts" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-accounts"></i>
            <span>Accounts</span>
          </Link>
        </li>
        <li className="sidebar-nav__item">
          <Link to="/dashboard/reports" className="sidebar-nav__link">
            <i className="sidebar-nav__icon admss-icon-reports"></i>
            <span>Reports</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}
