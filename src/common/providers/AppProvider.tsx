import { ReactElement, ReactNode } from "react";
import { ToastProvider } from "dashboard/common/toast";
import { NotificationProvider } from "dashboard/common/notification";
import { APIProvider } from "@vis.gl/react-google-maps";
import { AuthProvider } from "common/providers/AuthProvider";

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps): ReactElement => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <ToastProvider>
                <NotificationProvider>
                    <AuthProvider>{children}</AuthProvider>
                </NotificationProvider>
            </ToastProvider>
        );
    }

    return (
        <APIProvider apiKey={apiKey} libraries={["places"]}>
            <ToastProvider>
                <NotificationProvider>
                    <AuthProvider>{children}</AuthProvider>
                </NotificationProvider>
            </ToastProvider>
        </APIProvider>
    );
};
