import { Link } from "react-router-dom";
import "./index.css";
import { LS_APP_USER } from "common/constants/localStorage";
import { AuthUser } from "http/services/auth.service";
import { useState, useEffect } from "react";
import { getKeyValue } from "services/local-storage.service";

export default function Sidebar() {
    const [isSalesPerson, setIsSalesPerson] = useState<boolean>(false);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            setIsSalesPerson(!!authUser?.issalesperson);
        }
    }, []);
    return (
        <aside className='sidebar hidden lg:block'>
            <ul className='sidebar-nav'>
                <li className='sidebar-nav__item'>
                    <Link to='/dashboard' className='sidebar-nav__link'>
                        <div className='sidebar-nav__icon home'></div>
                        <span>Home</span>
                    </Link>
                </li>
                <li className='sidebar-nav__item'>
                    <Link to='/dashboard/inventory' className='sidebar-nav__link'>
                        <div className='sidebar-nav__icon inventory'></div>
                        <span>Inventory</span>
                    </Link>
                </li>
                {isSalesPerson || (
                    <>
                        <li className='sidebar-nav__item'>
                            <Link to='/dashboard/contacts' className='sidebar-nav__link'>
                                <div className='sidebar-nav__icon contacts'></div>
                                <span>Contacts</span>
                            </Link>
                        </li>
                        <li className='sidebar-nav__item'>
                            <Link to='/dashboard/deals' className='sidebar-nav__link'>
                                <div className='sidebar-nav__icon deals'></div>
                                <span>Deals</span>
                            </Link>
                        </li>
                        <li className='sidebar-nav__item'>
                            <Link to='/dashboard/accounts' className='sidebar-nav__link'>
                                <div className='sidebar-nav__icon accounts'></div>
                                <span>Accounts</span>
                            </Link>
                        </li>
                        <li className='sidebar-nav__item'>
                            <Link to='/dashboard/reports' className='sidebar-nav__link'>
                                <div className='sidebar-nav__icon reports'></div>
                                <span>Reports</span>
                            </Link>
                        </li>
                        <li className='sidebar-nav__item'>
                            <Link to='/dashboard/export-web' className='sidebar-nav__link'>
                                {/* TODO: change icon */}
                                <div className='sidebar-nav__icon reports'></div>
                                <span>Export to Web</span>
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </aside>
    );
}
