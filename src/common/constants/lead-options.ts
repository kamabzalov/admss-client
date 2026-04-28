export enum LEAD_STATUS_TONE {
    NEW = "new",
    IN_PROGRESS = "inProgress",
    COMPLETED = "completed",
    REJECTED = "rejected",
}

export enum LEAD_STATUS_TONE_MODIFIER {
    NEW = "new",
    IN_PROGRESS = "in-progress",
    COMPLETED = "completed",
    REJECTED = "rejected",
}

export enum DEAL_STATUS_ID {
    QUOTE_OR_PROSPECT = 0,
    PENDING_OR_IN_TRANSIT = 1,
    SOLD_NOT_FINALIZED = 2,
    SOLD_FINALIZED = 3,
    DEAD_OR_DELETED = 6,
}

export enum LEAD_TYPE_LABEL {
    TRADE_IN = "Trade-In",
    SERVICE = "Service",
}

export const LEAD_STATUS_LABEL: Record<LEAD_STATUS_TONE, string> = {
    [LEAD_STATUS_TONE.NEW]: "NEW",
    [LEAD_STATUS_TONE.IN_PROGRESS]: "IN PROGRESS",
    [LEAD_STATUS_TONE.COMPLETED]: "COMPLETED",
    [LEAD_STATUS_TONE.REJECTED]: "REJECTED",
};

export const LEAD_STATUS_CLASS_MODIFIER: Record<LEAD_STATUS_TONE, LEAD_STATUS_TONE_MODIFIER> = {
    [LEAD_STATUS_TONE.NEW]: LEAD_STATUS_TONE_MODIFIER.NEW,
    [LEAD_STATUS_TONE.IN_PROGRESS]: LEAD_STATUS_TONE_MODIFIER.IN_PROGRESS,
    [LEAD_STATUS_TONE.COMPLETED]: LEAD_STATUS_TONE_MODIFIER.COMPLETED,
    [LEAD_STATUS_TONE.REJECTED]: LEAD_STATUS_TONE_MODIFIER.REJECTED,
};

export const LEAD_TYPE_OPTIONS = [
    { label: LEAD_TYPE_LABEL.TRADE_IN, value: "trade-in" },
    { label: LEAD_TYPE_LABEL.SERVICE, value: "service" },
];

export const LEAD_STATUS_OPTIONS = [
    { label: "New", value: LEAD_STATUS_TONE_MODIFIER.NEW },
    { label: "In Progress", value: LEAD_STATUS_TONE_MODIFIER.IN_PROGRESS },
    { label: "Completed", value: LEAD_STATUS_TONE_MODIFIER.COMPLETED },
    { label: "Rejected", value: LEAD_STATUS_TONE_MODIFIER.REJECTED },
];

export const VISIT_TYPE_OPTIONS = [
    { label: "Wait", value: "wait" },
    { label: "Drop Off", value: "drop-off" },
];

export const WARRANTY_OPTIONS = [
    { label: "No", value: "no" },
    { label: "Yes", value: "yes" },
];

export const SERVICE_TYPE_OPTIONS = [
    { label: "Car Repair", value: "car-repair" },
    { label: "Scheduled Maintenance", value: "scheduled-maintenance" },
    { label: "State Inspection", value: "state-inspection" },
    { label: "Other Services", value: "other-services" },
];
