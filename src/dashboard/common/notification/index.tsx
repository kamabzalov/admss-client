import { ReactElement, ReactNode, createContext, useContext, useState, useCallback } from "react";
import { DashboardDialog } from "dashboard/common/dialog";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import "./index.css";
import { NOTIFICATION_TITLE_STATUS } from "common/constants/title-status";

export enum NOTIFICATION_TYPE {
    INFO,
    WARNING,
    ERROR,
}

interface NotificationOptions {
    type?: NOTIFICATION_TYPE;
    description?: string;
    onAccept?: () => void | Promise<void>;
}

interface NotificationContextValue {
    showNotification: (options?: NotificationOptions) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps): ReactElement => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [notificationType, setNotificationType] = useState<NOTIFICATION_TYPE>(
        NOTIFICATION_TYPE.INFO
    );
    const [notificationDescription, setNotificationDescription] = useState<string>("");
    const [onAcceptCallback, setOnAcceptCallback] = useState<
        (() => void | Promise<void>) | undefined
    >();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [defaultNotificationTitle] = NOTIFICATION_TITLE_STATUS;

    const showNotification = useCallback((options: NotificationOptions = {}) => {
        setNotificationType(options.type || NOTIFICATION_TYPE.INFO);
        setNotificationDescription(options.description || "");
        setOnAcceptCallback(() => options.onAccept);
        setIsLoading(false);
        setIsVisible(true);
    }, []);

    const hideNotification = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleAccept = useCallback(async () => {
        setIsLoading(true);
        try {
            if (onAcceptCallback) {
                await onAcceptCallback();
            }
            hideNotification();
        } finally {
            setIsLoading(false);
        }
    }, [onAcceptCallback, hideNotification]);

    const getNotificationModifier = () => {
        switch (notificationType) {
            case NOTIFICATION_TYPE.INFO:
                return "notification--info";
            case NOTIFICATION_TYPE.WARNING:
                return "notification--warning";
            case NOTIFICATION_TYPE.ERROR:
                return "notification--error";
            default:
                return "notification--info";
        }
    };

    const getNotificationTitle = () => {
        return NOTIFICATION_TITLE_STATUS.find((title) => title.id === notificationType)?.title;
    };

    const getNotificationIcon = () => {
        switch (notificationType) {
            case NOTIFICATION_TYPE.INFO:
                return "pi pi-info-circle";
            case NOTIFICATION_TYPE.WARNING:
                return "adms-warning";
            case NOTIFICATION_TYPE.ERROR:
                return "adms-warning";
            default:
                return "adms-info";
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            <DashboardDialog
                header={
                    <div className='notification-header'>
                        <i className={`${getNotificationIcon()} notification-header__icon`} />
                        <div className='notification-header__title'>
                            {getNotificationTitle() || defaultNotificationTitle.name}
                        </div>
                    </div>
                }
                children={
                    <div className='text-center w-full notification-body'>
                        {notificationDescription}
                    </div>
                }
                onHide={hideNotification}
                className={`notification ${getNotificationModifier()}`}
                visible={isVisible}
                action={handleAccept}
                footer='Got it'
                buttonDisabled={isLoading}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === null) {
        throw new Error(ERROR_MESSAGES.PROVIDER_ERROR);
    }
    return context;
};
