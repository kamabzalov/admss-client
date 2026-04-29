import * as Yup from "yup";
import {
    LeadFormValues,
    LeadStatus,
    LeadType,
    ServiceVisitType,
    ExistingLeadState,
    emptyLeadValues,
} from "dashboard/leads/form/types";
import { CREATE_ID } from "common/constants/links";
import { ERROR_MESSAGES } from "common/constants/error-messages";

export const LOCAL_STORAGE_KEY = "lead-form-drafts";

export enum LEAD_TYPE {
    TRADE_IN = "trade-in",
    SERVICE = "service",
}

const mapExistingLeadToForm = (lead?: ExistingLeadState["lead"]): LeadFormValues | null => {
    if (!lead) return null;
    const [firstName = "", ...lastNameParts] = String(lead.contactinfo || "")
        .trim()
        .split(/\s+/);
    const inferredType: LeadType =
        Number(lead.dealtype) <= 1 ? LEAD_TYPE.TRADE_IN : LEAD_TYPE.SERVICE;
    return {
        ...emptyLeadValues,
        type: inferredType,
        status: "new",
        firstName,
        lastName: lastNameParts.join(" "),
        vin: String(lead.inventoryinfo || ""),
    };
};

export const getInitialValues = (
    id?: string,
    stateLead?: ExistingLeadState["lead"]
): LeadFormValues => {
    if (!id || id === CREATE_ID) return emptyLeadValues;
    try {
        const value = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!value) {
            const mapped = mapExistingLeadToForm(stateLead);
            return mapped ? { ...mapped, id } : { ...emptyLeadValues, id };
        }
        const parsed = JSON.parse(value) as Record<string, LeadFormValues>;
        if (parsed[id]) return parsed[id];
        const mapped = mapExistingLeadToForm(stateLead);
        return mapped ? { ...mapped, id } : { ...emptyLeadValues, id };
    } catch {
        const mapped = mapExistingLeadToForm(stateLead);
        return mapped ? { ...mapped, id } : { ...emptyLeadValues, id };
    }
};

export const saveLeadDraft = (values: LeadFormValues) => {
    const nextValues = { ...values, id: values.id || crypto.randomUUID() };
    const existingRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = existingRaw ? (JSON.parse(existingRaw) as Record<string, LeadFormValues>) : {};
    existing[nextValues.id] = nextValues;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
};

export const isContactStepValid = (values: LeadFormValues): boolean => {
    if (values.type !== LEAD_TYPE.TRADE_IN) return false;
    return Boolean(
        values.type &&
            values.firstName.trim() &&
            values.lastName.trim() &&
            values.email.trim() &&
            values.phone.trim()
    );
};

export const isVehicleStepValid = (values: LeadFormValues): boolean => {
    if (values.type === LEAD_TYPE.TRADE_IN) {
        return Boolean(
            values.vin.trim() &&
                values.make.trim() &&
                values.model.trim() &&
                values.year.trim() &&
                values.mileage.trim() &&
                values.desiredPrice !== null &&
                values.payoffAmount !== null
        );
    }

    if (values.type === LEAD_TYPE.SERVICE) {
        return Boolean(values.vehicle.trim() && values.typeOfService.trim());
    }

    return false;
};

export const validationSchema = Yup.object({
    id: Yup.string().default(""),
    type: Yup.mixed<LeadType>()
        .oneOf([LEAD_TYPE.TRADE_IN, LEAD_TYPE.SERVICE])
        .required("Data is required."),
    status: Yup.mixed<LeadStatus | "">()
        .oneOf(["", "new", "in-progress", "completed", "rejected"])
        .notRequired(),
    firstName: Yup.string().trim().required(ERROR_MESSAGES.REQUIRED),
    lastName: Yup.string().trim().required(ERROR_MESSAGES.REQUIRED),
    state: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    city: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    email: Yup.string().trim().email(ERROR_MESSAGES.EMAIL).required(ERROR_MESSAGES.REQUIRED),
    phone: Yup.string().trim().required(ERROR_MESSAGES.REQUIRED),
    message: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    preferredDateTime: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.SERVICE,
            then: (schema) => schema.required(ERROR_MESSAGES.REQUIRED),
            otherwise: (schema) => schema.notRequired(),
        }),
    waitOrDropOff: Yup.mixed<ServiceVisitType | "">().when("type", {
        is: LEAD_TYPE.SERVICE,
        then: (schema) => schema.oneOf(["wait", "drop-off", ""]).notRequired(),
        otherwise: (schema) => schema.notRequired(),
    }),
    vin: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    vehicle: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.SERVICE,
            then: (schema) => schema.required(ERROR_MESSAGES.REQUIRED),
            otherwise: (schema) => schema.notRequired(),
        }),
    make: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    model: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    year: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    mileage: Yup.string().trim().notRequired(),
    warranty: Yup.string().trim().notRequired(),
    typeOfService: Yup.string()
        .trim()
        .when("type", {
            is: LEAD_TYPE.SERVICE,
            then: (schema) => schema.required(ERROR_MESSAGES.REQUIRED),
            otherwise: (schema) => schema.notRequired(),
        }),
    desiredPrice: Yup.number()
        .nullable()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.min(0, "Value must be positive.").notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    payoffAmount: Yup.number()
        .nullable()
        .when("type", {
            is: LEAD_TYPE.TRADE_IN,
            then: (schema) => schema.min(0, "Value must be positive.").notRequired(),
            otherwise: (schema) => schema.notRequired(),
        }),
    vehicleAdditionalInfo: Yup.string().trim().notRequired(),
});
