import { ReactElement, ReactNode } from "react";
import { ToastProvider } from "dashboard/common/toast";
import { NotificationProvider } from "dashboard/common/notification";

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps): ReactElement => {
    return (
        <ToastProvider>
            <NotificationProvider>{children}</NotificationProvider>
        </ToastProvider>
    );
};
