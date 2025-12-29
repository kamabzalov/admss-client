export const LS_APP_USER: string = "admss-client-app-user";
export const LS_REMEMBER_ME: string = "admss-client-remember-me";
export const LS_LAST_ROUTE: string = "admss-client-last-route";
export const LS_DEVICE_UID: string = "admss-client-device-uid";

export interface LastRouteData {
    path: string;
    timestamp: number;
    useruid: string;
}
