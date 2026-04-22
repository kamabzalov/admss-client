export type LeadType = "trade-in" | "service";
export type LeadStatus = "new" | "in-progress" | "completed" | "rejected";
export type ServiceVisitType = "wait" | "drop-off";

export interface LeadFormValues {
    id: string;
    type: LeadType | "";
    status: LeadStatus | "";
    firstName: string;
    lastName: string;
    state: string;
    city: string;
    email: string;
    phone: string;
    message: string;
    preferredDateTime: string;
    waitOrDropOff: ServiceVisitType | "";
    vin: string;
    make: string;
    model: string;
    year: string;
    mileage: string;
    desiredPrice: number | null;
    payoffAmount: number | null;
    vehicleAdditionalInfo: string;
}

export interface ExistingLeadState {
    lead?: {
        contactinfo?: string;
        inventoryinfo?: string;
        dealtype?: number;
        status?: string;
    };
}

export const LEAD_TYPE_OPTIONS = [
    { label: "Trade-in", value: "trade-in" },
    { label: "Service", value: "service" },
];

export const LEAD_STATUS_OPTIONS = [
    { label: "New", value: "new" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
];

export const VISIT_TYPE_OPTIONS = [
    { label: "Wait", value: "wait" },
    { label: "Drop Off", value: "drop-off" },
];

export const emptyLeadValues: LeadFormValues = {
    id: "",
    type: "",
    status: "",
    firstName: "",
    lastName: "",
    state: "",
    city: "",
    email: "",
    phone: "",
    message: "",
    preferredDateTime: "",
    waitOrDropOff: "",
    vin: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    desiredPrice: null,
    payoffAmount: null,
    vehicleAdditionalInfo: "",
};

export const CONVERT_DISABLED_HINT = "Fill all required fields on this page to convert.";
