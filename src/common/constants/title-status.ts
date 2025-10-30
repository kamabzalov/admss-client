import { TypeList } from "common/models";

export const TITLE_STATUS_LIST: readonly TypeList[] = [
    {
        name: "Default",
        id: 0,
    },
    {
        name: "Not Received",
        id: 1,
    },
    {
        name: "Lost",
        id: 2,
    },
    {
        name: "Applied For",
        id: 3,
    },
    {
        name: "With Lienholder Pending Payoff",
        id: 4,
    },
    {
        name: "In Transit",
        id: 5,
    },
    {
        name: "Received",
        id: 6,
    },
];

export enum NOTIFICATION_TITLE {
    INFO = "Scheduled Maintenance",
    WARNING = "Maintenance in Progress",
    ERROR = "Connection Lost",
}
interface NotificationTitle extends TypeList {
    title: NOTIFICATION_TITLE;
}

export const NOTIFICATION_TITLE_STATUS: readonly NotificationTitle[] = [
    {
        name: "Info",
        id: 0,
        title: NOTIFICATION_TITLE.INFO,
    },
    {
        name: "Warning",
        id: 1,
        title: NOTIFICATION_TITLE.WARNING,
    },
    {
        name: "Error",
        id: 2,
        title: NOTIFICATION_TITLE.ERROR,
    },
];
