import "./index.css";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { useState } from "react";
import newContact from "assets/images/icons/common-tasks/new-contact.svg";
import browseAllContacts from "assets/images/icons/common-tasks/browse-all-contacts.svg";
import newInventory from "assets/images/icons/common-tasks/new-inventory.svg";
import browseAllInventory from "assets/images/icons/common-tasks/browse-all-inventory.svg";
import newDeal from "assets/images/icons/common-tasks/new-deal.svg";
import browseAllDeals from "assets/images/icons/common-tasks/browse-all-deals.svg";
import testDrive from "assets/images/icons/common-tasks/test-drive.svg";
import { Link } from "react-router-dom";

export default function Home() {
    const [date] = useState(null);
    const [first, setFirst] = useState<boolean>(false);
    const [second, setSecond] = useState<boolean>(false);
    const [third, setThird] = useState<boolean>(false);
    const [fourth, setFourth] = useState<boolean>(false);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Common tasks</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='contacts'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <img
                                        src={newContact}
                                        alt='Add new contact'
                                        className='common-tasks-menu__icon'
                                    />
                                    New Contact
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='contacts'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <img
                                        src={browseAllContacts}
                                        alt='Browse all contact'
                                        className='common-tasks-menu__icon'
                                    />
                                    Browse all contacts
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='inventory'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <img
                                        src={newInventory}
                                        alt='New inventory'
                                        className='common-tasks-menu__icon'
                                    />
                                    New inventory
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='inventory'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <img
                                        src={browseAllInventory}
                                        alt='Browse all inventory'
                                        className='common-tasks-menu__icon'
                                    />
                                    Browse all inventory
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link to='deals' className='common-tasks-menu__item cursor-pointer'>
                                    <img
                                        src={newDeal}
                                        alt='New deal'
                                        className='common-tasks-menu__icon'
                                    />
                                    New deal
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link to='deals' className='common-tasks-menu__item cursor-pointer'>
                                    <img
                                        src={browseAllDeals}
                                        alt='Browse all deals'
                                        className='common-tasks-menu__icon'
                                    />
                                    Browse all deals
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <div className='common-tasks-menu__item cursor-pointer'>
                                    <img
                                        src={testDrive}
                                        alt='New inventory'
                                        className='common-tasks-menu__icon'
                                    />
                                    Print (for test drive)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-content'>
                        <div className='grid justify-content-between'>
                            <div className='col-12 md:col-5'>
                                <h2 className='card-content__title uppercase'>Tasks</h2>
                                <ul className='list-none ml-0 pl-0'>
                                    <li className='mb-2'>
                                        <Checkbox
                                            onChange={(e) => setFirst(!!e.checked)}
                                            checked={first}
                                        ></Checkbox>
                                        <label className='ml-2'>
                                            Add new arrivals to inventory
                                        </label>
                                    </li>
                                    <li className='mb-2'>
                                        <Checkbox
                                            onChange={(e) => setSecond(!!e.checked)}
                                            checked={second}
                                        ></Checkbox>
                                        <label className='ml-2'>Complete all daily tasks</label>
                                    </li>
                                    <li className='mb-2'>
                                        <Checkbox
                                            onChange={(e) => setThird(!!e.checked)}
                                            checked={third}
                                        ></Checkbox>
                                        <label className='ml-2'>Complete all daily tasks</label>
                                    </li>
                                    <li className='mb-2'>
                                        <Checkbox
                                            onChange={(e) => setFourth(!!e.checked)}
                                            checked={fourth}
                                        ></Checkbox>
                                        <label className='ml-2'>Create new tasks</label>
                                    </li>
                                </ul>
                                <span className='add-task-control font-semibold cursor-pointer'>
                                    <i className='pi pi-plus add-task-control__icon'></i>
                                    Add new task
                                </span>
                            </div>
                            <div className='col-12 md:col-7 md:text-right'>
                                <Calendar value={date} inline />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-12 xl:col-4'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Recent messages</h2>
                    </div>
                    <div className='card-content'>
                        <table className='table-message'>
                            <thead>
                                <tr>
                                    <th>From</th>
                                    <th>Theme</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='success fw-600'>Support team</td>
                                    <td className='success fw-600'>New inventory adding failure</td>
                                    <td className='success fw-600'>04/26/2023 15:45:12</td>
                                </tr>
                                <tr>
                                    <td>Support team</td>
                                    <td>Empty tables</td>
                                    <td>04/14/2023 15:45:12</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className='text-right cursor-pointer underline messages-more'>
                            See more...
                        </p>
                    </div>
                </div>
            </div>
            <div className='col-12 xl:col-4'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Recently added contact</h2>
                    </div>
                    <div className='card-content'>
                        <dl className='contact-item flex'>
                            <dt className='contact-item__label'>Name:</dt>
                            <dd>Johnny Walker</dd>
                        </dl>
                        <dl className='contact-item flex'>
                            <dt className='contact-item__label'>Phone:</dt>
                            <dd>631-429-6822</dd>
                        </dl>
                        <dl className='contact-item flex'>
                            <dt className='contact-item__label'>E-mail:</dt>
                            <dd>walkerjohnny@hotmail.com</dd>
                        </dl>
                        <dl className='contact-item flex'>
                            <dt className='contact-item__label'>Date & time:</dt>
                            <dd>26, April 2023</dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div className='col-12 xl:col-4'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='uppercase m-0'>Printing</h2>
                    </div>
                    <div className='card-content'>
                        <ul className='list-none pl-0 printing-menu'>
                            <li className='printing-menu__item'>
                                <i className='admss-icon-email printing-menu__icon' />
                                Mailings
                            </li>
                            <li className='printing-menu__item '>
                                <i className='admss-icon-blank printing-menu__icon' />
                                Blank credit application
                            </li>
                            <li className='printing-menu__item'>
                                <i className='admss-icon-print printing-menu__icon' />
                                Print "Initial privacy notice"
                            </li>
                            <li className='printing-menu__item'>
                                <i className='admss-icon-print printing-menu__icon' />
                                Print deal forms
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
