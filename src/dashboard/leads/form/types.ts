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
    vehicle: string;
    make: string;
    model: string;
    year: string;
    mileage: string;
    warranty: string;
    typeOfService: string;
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
    vehicle: "",
    make: "",
    model: "",
    year: "",
    mileage: "",
    warranty: "",
    typeOfService: "",
    desiredPrice: null,
    payoffAmount: null,
    vehicleAdditionalInfo: "",
};

export const CONVERT_DISABLED_HINT = "Fill all required fields on this page to convert.";
