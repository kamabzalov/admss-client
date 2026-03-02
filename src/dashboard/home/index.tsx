import { Calendar } from "primereact/calendar";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TasksWidget } from "dashboard/tasks/widget";
import { useStore } from "store/hooks";
import { RecentMessages } from "dashboard/home/recent-messages";
import { LatestUpdates } from "dashboard/home/latest-updates";
import "./index.css";
import { getAlerts, setAlert } from "http/services/tasks.service";
import { useNotification, usePermissions, useToastMessage } from "common/hooks";
import { Alert } from "common/models/tasks";

const ALERT_SHOWN_KEY = "alert_shown";

export const Home = (): ReactElement => {
    const store = useStore().userStore;
    const {
        inventoryPermissions,
        contactPermissions,
        dealPermissions,
        accountPermissions,
        salesPermissions,
    } = usePermissions();
    const { authUser } = store;
    const [date] = useState<Date | null>(null);
    const { showNotification } = useNotification();
    const { showError } = useToastMessage();
    const [pendingAlerts, setPendingAlerts] = useState<Alert[]>([]);

    const handleGetGlobalData = useCallback(async () => {
        if (!authUser || !Object.keys(authUser.permissions).length) return;

        const alertShownKey = `${ALERT_SHOWN_KEY}_${authUser.useruid}`;
        const wasAlertShown = sessionStorage.getItem(alertShownKey);

        if (!wasAlertShown) {
            const alerts = await getAlerts(authUser.useruid);
            if (alerts && Array.isArray(alerts) && alerts.length > 0) {
                setPendingAlerts(alerts);
            }
        }
    }, [authUser]);

    const showNextAlert = useCallback(
        async (currentAlert: Alert) => {
            const result = await setAlert(currentAlert.itemuid);

            if (result?.error) {
                setPendingAlerts([]);
                const alertShownKey = `${ALERT_SHOWN_KEY}_${authUser!.useruid}`;
                sessionStorage.setItem(alertShownKey, "true");
                showError(result.error);
                return;
            }

            setPendingAlerts((previousAlerts) => {
                const remainingAlerts = previousAlerts.slice(1);

                if (remainingAlerts.length === 0 && authUser) {
                    const alertShownKey = `${ALERT_SHOWN_KEY}_${authUser.useruid}`;
                    sessionStorage.setItem(alertShownKey, "true");
                }

                return remainingAlerts;
            });
        },
        [authUser]
    );

    useEffect(() => {
        if (pendingAlerts.length > 0) {
            const currentAlert = pendingAlerts[0];
            showNotification({
                type: currentAlert.alerttype,
                description: currentAlert.description,
                onAccept: () => showNextAlert(currentAlert),
            });
        }
    }, [pendingAlerts, showNotification, showNextAlert]);

    useEffect(() => {
        handleGetGlobalData();
    }, [handleGetGlobalData]);

    return (
        <div className='grid home-page'>
            <div className='col-12'>
                <div className='card common-tasks'>
                    <div className='card-header'>
                        <h2 className='card-header__title uppercase m-0'>Common tasks</h2>
                    </div>
                    <div className='card-content common-tasks-menu flex flex-wrap lg:justify-content-between md:justify-content-center gap-6'>
                        {salesPermissions.canShowContacts() &&
                            contactPermissions.canSeeInMenu() && (
                                <>
                                    {contactPermissions.canCreate() && (
                                        <Link
                                            to='contacts/create'
                                            className='common-tasks-menu__item new-contact cursor-pointer'
                                        >
                                            <div className='common-tasks-menu__icon new-contact'></div>
                                            New Contact
                                        </Link>
                                    )}
                                    <Link
                                        to='contacts'
                                        className='common-tasks-menu__item cursor-pointer'
                                    >
                                        <div className='common-tasks-menu__icon browse-all-contacts'></div>
                                        Browse <br /> all contacts
                                    </Link>
                                </>
                            )}
                        {inventoryPermissions.canSeeInMenu() &&
                            inventoryPermissions.canCreate() && (
                                <Link
                                    to='inventory/create'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <div className='common-tasks-menu__icon new-inventory'></div>
                                    New inventory
                                </Link>
                            )}
                        {inventoryPermissions.canSeeInMenu() && (
                            <Link to='inventory' className='common-tasks-menu__item cursor-pointer'>
                                <div className='common-tasks-menu__icon browser-all-inventory'></div>
                                Browse <br /> all inventory
                            </Link>
                        )}
                        {salesPermissions.canShowDeals() && dealPermissions.canSeeInMenu() && (
                            <>
                                {dealPermissions.canCreate() && (
                                    <Link
                                        to='deals/create'
                                        className='common-tasks-menu__item cursor-pointer'
                                    >
                                        <div className='common-tasks-menu__icon new-deal'></div>
                                        New deal
                                    </Link>
                                )}
                                <Link to='deals' className='common-tasks-menu__item cursor-pointer'>
                                    <div className='common-tasks-menu__icon browse-all-deals'></div>
                                    Browse <br /> all deals
                                </Link>
                            </>
                        )}
                        {salesPermissions.canShowAccounts() &&
                            accountPermissions.canSeeInMenu() && (
                                <Link
                                    to='accounts'
                                    className='common-tasks-menu__item cursor-pointer'
                                >
                                    <div className='common-tasks-menu__icon browse-all-contacts'></div>
                                    Browse <br /> all accounts
                                </Link>
                            )}
                        <Link to='test-drive' className='common-tasks-menu__item cursor-pointer'>
                            <div className='common-tasks-menu__icon print-test-drive'></div>
                            Print <br /> (for test drive)
                        </Link>
                    </div>
                </div>
            </div>
            <div className='col-12 lg:col-8 xl:col-7'>
                <div className='card home-page__tasks-widget'>
                    <div className='card-content'>
                        <div className='grid lg:justify-content-between md:justify-content-center'>
                            <div className='col-12 lg:col-6 xl:col-7'>
                                <TasksWidget />
                            </div>

                            <div className='col-12 lg:col-6 xl:col-5 xl:text-right task-calendar p-0'>
                                <Calendar className='task-calendar__input' value={date} inline />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-12 lg:col-4 xl:col-5'>
                <LatestUpdates />
            </div>
            <div className='col-12 xl:col-5'>
                <RecentMessages />
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
            <div className='col-12 xl:col-3'>
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
        </div>
    );
};
