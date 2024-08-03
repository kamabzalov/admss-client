import "./index.css";
import { Calendar } from "primereact/calendar";
import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tasks } from "dashboard/tasks";
import { useStore } from "store/hooks";
import { SupportHistoryDialog } from "dashboard/profile/supportHistory";
import { Button } from "primereact/button";

export const Home = (): ReactElement => {
    const store = useStore().userStore;
    const { authUser } = store;
    const [isSalesPerson, setIsSalesPerson] = useState(true);
    useEffect(() => {
        if (authUser && Object.keys(authUser.permissions).length) {
            const { permissions } = authUser;
            const { uaSalesPerson, ...otherPermissions } = permissions;
            if (Object.values(otherPermissions).some((permission) => permission === 1)) {
                return setIsSalesPerson(false);
            }
            if (!!uaSalesPerson) setIsSalesPerson(true);
        }
    }, [authUser, authUser?.permissions]);
    const [date] = useState(null);
    const [supportHistory, setSupportHistory] = useState<boolean>(false);

    return (
        <div className='grid'>
            <div className='col-12'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Common tasks</h2>
                    </div>
                    <div className='card-content'>
                        <div className='grid'>
                            {isSalesPerson || (
                                <>
                                    <div className='col-12 md:col-6 lg:col-3'>
                                        <Link
                                            to='contacts/create'
                                            className='common-tasks-menu__item new-contact cursor-pointer'
                                        >
                                            <div className='common-tasks-menu__icon new-contact'></div>
                                            New Contact
                                        </Link>
                                    </div>
                                    <div className='col-12 md:col-6 lg:col-3'>
                                        <Link
                                            to='contacts'
                                            className='common-tasks-menu__item cursor-pointer'
                                        >
                                            <div className='common-tasks-menu__icon browse-all-contacts'></div>
                                            Browse all contacts
                                        </Link>
                                    </div>
                                </>
                            )}
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='inventory/create'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <div className='common-tasks-menu__icon new-inventory'></div>
                                    New inventory
                                </Link>
                            </div>
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='inventory'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <div className='common-tasks-menu__icon browser-all-inventory'></div>
                                    Browse all inventory
                                </Link>
                            </div>
                            {isSalesPerson || (
                                <>
                                    <div className='col-12 md:col-6 lg:col-3'>
                                        <Link
                                            to='deals/create'
                                            className='common-tasks-menu__item cursor-pointer'
                                        >
                                            <div className='common-tasks-menu__icon new-deal'></div>
                                            New deal
                                        </Link>
                                    </div>
                                    <div className='col-12 md:col-6 lg:col-3'>
                                        <Link
                                            to='deals'
                                            className='common-tasks-menu__item cursor-pointer'
                                        >
                                            <div className='common-tasks-menu__icon browse-all-deals'></div>
                                            Browse all deals
                                        </Link>
                                    </div>
                                </>
                            )}
                            <div className='col-12 md:col-6 lg:col-3'>
                                <Link
                                    to='test-drive'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <div className='common-tasks-menu__icon print-test-drive'></div>
                                    Print (for test drive)
                                </Link>
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
                                <Tasks />
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
                        <div className='card-content__footer'>
                            <Button
                                onClick={() => setSupportHistory(true)}
                                className='underline messages-more'
                                text
                            >
                                See more...
                            </Button>
                        </div>
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
                                <i className='adms-email printing-menu__icon' />
                                Mailings
                            </li>
                            <li className='printing-menu__item '>
                                <i className='adms-blank printing-menu__icon' />
                                Blank credit application
                            </li>
                            <li className='printing-menu__item'>
                                <i className='adms-print printing-menu__icon' />
                                Print "Initial privacy notice"
                            </li>
                            <li className='printing-menu__item'>
                                <i className='adms-print printing-menu__icon' />
                                Print deal forms
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {authUser && (
                <>
                    <SupportHistoryDialog
                        onHide={() => setSupportHistory(false)}
                        useruid={authUser.useruid}
                        visible={supportHistory}
                    />
                </>
            )}
        </div>
    );
};
