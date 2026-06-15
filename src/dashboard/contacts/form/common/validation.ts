import * as Yup from "yup";
import { Contact, ContactExtData } from "common/models/contact";
import {
    EMAIL_REGEX,
    LETTERS_NUMBERS_SIGNS_REGEX,
    PHONE_NUMBER_REGEX,
    SSN_REGEX,
    SSN_VALID_LENGTH,
} from "common/constants/regex";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { ContactAccordionItems } from "dashboard/contacts/common/step-navigation";
import { BUYER_ID } from "dashboard/contacts/form/general-info";
import { REQUIRED_COMPANY_TYPE_INDEXES } from "dashboard/contacts/form/common/constants";
import { PartialContact } from "dashboard/contacts/form/common/types";

const tabFields: Partial<Record<ContactAccordionItems, (keyof PartialContact)[]>> = {
    [ContactAccordionItems.BUYER]: [
        "firstName",
        "lastName",
        "type",
        "businessName",
        "Buyer_SS_Number",
    ],
    [ContactAccordionItems.CO_BUYER]: [
        "CoBuyer_First_Name",
        "CoBuyer_Last_Name",
        "CoBuyer_SS_Number",
    ],
    [ContactAccordionItems.CONTACTS]: ["email1", "email2", "phone1", "phone2"],
    [ContactAccordionItems.COMPANY]: ["Buyer_Emp_Ext", "Buyer_Emp_Phone"],
};

export const buildFormValues = (contact: Contact, contactExtData: ContactExtData): PartialContact =>
    ({
        firstName: contact?.firstName || "",
        middleName: contact?.middleName || "",
        lastName: contact?.lastName || "",
        type: contact?.type || null,
        businessName: contact?.businessName || "",
        email1: contact?.email1 || "",
        email2: contact?.email2 || "",
        phone1: contact?.phone1?.replace(/[^0-9]/g, "") || "",
        phone2: contact?.phone2?.replace(/[^0-9]/g, "") || "",
        Buyer_Emp_Ext: contactExtData.Buyer_Emp_Ext || "",
        Buyer_Emp_Phone: contactExtData.Buyer_Emp_Phone || "",
        CoBuyer_First_Name: contactExtData.CoBuyer_First_Name || "",
        CoBuyer_Middle_Name: contactExtData.CoBuyer_Middle_Name || "",
        CoBuyer_Last_Name: contactExtData.CoBuyer_Last_Name || "",
        Buyer_SS_Number: contactExtData.Buyer_SS_Number || "",
        CoBuyer_SS_Number: contactExtData.CoBuyer_SS_Number || "",
    }) as PartialContact;

const isFieldValueEmpty = (value: PartialContact[keyof PartialContact]): boolean =>
    value === null || value === undefined || (typeof value === "string" && !value.trim());

const handleValidationMessage = (text: string, isShort?: boolean) => {
    const defaultMessage = `${text || "This field"} does not match the required format.`;
    const shortMessage = `${text || "This field"} is invalid.`;
    return isShort ? shortMessage : defaultMessage;
};

export const ContactFormSchema: Yup.ObjectSchema<Partial<PartialContact>> = Yup.object().shape({
    firstName: Yup.string()
        .trim()
        .test("firstNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { type, businessName } = this.parent;
            if (!REQUIRED_COMPANY_TYPE_INDEXES.includes(type) && !businessName?.trim()) {
                return !!value?.trim();
            }
            return true;
        })
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("First name"),
            excludeEmptyString: true,
        }),
    middleName: Yup.string()
        .trim()
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("Middle name"),
        }),
    lastName: Yup.string()
        .trim()
        .test("lastNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { type, businessName } = this.parent;
            if (!REQUIRED_COMPANY_TYPE_INDEXES.includes(type) && !businessName?.trim()) {
                return !!value?.trim();
            }
            return true;
        })
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("Last name"),
            excludeEmptyString: true,
        }),
    businessName: Yup.string()
        .trim()
        .test("businessNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { type } = this.parent;
            if (REQUIRED_COMPANY_TYPE_INDEXES.includes(type)) {
                return !!value?.trim();
            }
            return true;
        }),
    type: Yup.number()
        .test("typeRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            return value !== 0 && value !== null && value !== undefined;
        })
        .required(ERROR_MESSAGES.REQUIRED),
    email1: Yup.string().email(ERROR_MESSAGES.EMAIL).matches(EMAIL_REGEX, {
        message: ERROR_MESSAGES.EMAIL,
    }),
    email2: Yup.string().email(ERROR_MESSAGES.EMAIL).matches(EMAIL_REGEX, {
        message: ERROR_MESSAGES.EMAIL,
    }),
    phone1: Yup.string()
        .transform((value) => value.replace(/[-+]/g, ""))
        .matches(PHONE_NUMBER_REGEX, {
            message: ERROR_MESSAGES.PHONE,
            excludeEmptyString: false,
        }),
    phone2: Yup.string()
        .transform((value) => value.replace(/[-+]/g, ""))
        .matches(PHONE_NUMBER_REGEX, {
            message: ERROR_MESSAGES.PHONE,
            excludeEmptyString: false,
        }),
    Buyer_Emp_Ext: Yup.string().email(ERROR_MESSAGES.EMAIL).matches(EMAIL_REGEX, {
        message: ERROR_MESSAGES.EMAIL,
    }),
    Buyer_Emp_Phone: Yup.string()
        .transform((value) => value.replace(/[-+]/g, ""))
        .matches(PHONE_NUMBER_REGEX, {
            message: ERROR_MESSAGES.PHONE,
            excludeEmptyString: false,
        }),
    CoBuyer_First_Name: Yup.string()
        .trim()
        .test("coBuyerFirstNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { CoBuyer_Last_Name, CoBuyer_Middle_Name, type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (type === BUYER_ID && (CoBuyer_Last_Name?.trim() || CoBuyer_Middle_Name?.trim())) {
                return !!value?.trim();
            }
            return true;
        })
        .test("coBuyerFirstNameFormat", handleValidationMessage("First name"), function (value) {
            const { type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (!value || !value.trim()) return true;
            return LETTERS_NUMBERS_SIGNS_REGEX.test(value);
        }),
    CoBuyer_Middle_Name: Yup.string()
        .trim()
        .test("coBuyerMiddleNameFormat", handleValidationMessage("Middle name"), function (value) {
            const { type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (!value || !value.trim()) return true;
            return LETTERS_NUMBERS_SIGNS_REGEX.test(value);
        }),
    CoBuyer_Last_Name: Yup.string()
        .trim()
        .test("coBuyerLastNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { CoBuyer_First_Name, CoBuyer_Middle_Name, type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (type === BUYER_ID && (CoBuyer_First_Name?.trim() || CoBuyer_Middle_Name?.trim())) {
                return !!value?.trim();
            }
            return true;
        })
        .test("coBuyerLastNameFormat", handleValidationMessage("Last name"), function (value) {
            const { type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (!value || !value.trim()) return true;
            return LETTERS_NUMBERS_SIGNS_REGEX.test(value);
        }),
    Buyer_SS_Number: Yup.string().test(
        "ssnFormat",
        handleValidationMessage("Buyer SSN", true),
        function (value) {
            if (!value || !value.trim().length) return true;
            const digitsOnly = value.replace(/\D/g, "");
            if (!!digitsOnly.length && digitsOnly.length < SSN_VALID_LENGTH) return false;
            return SSN_REGEX.test(value);
        }
    ),
    CoBuyer_SS_Number: Yup.string().test(
        "ssnFormat",
        handleValidationMessage("Co-Buyer SSN", true),
        function (value) {
            const { type } = this.parent;
            if (type !== BUYER_ID) return true;
            if (!value || !value.trim().length) return true;
            const digitsOnly = value.replace(/\D/g, "");
            if (!!digitsOnly.length && digitsOnly.length < SSN_VALID_LENGTH) return false;
            return SSN_REGEX.test(value);
        }
    ),
});

const getFieldValidationError = (
    field: keyof PartialContact,
    values: PartialContact
): string | undefined => {
    if (isFieldValueEmpty(values[field])) {
        return undefined;
    }

    try {
        ContactFormSchema.validateSyncAt(field, values);
        return undefined;
    } catch (error) {
        if (error instanceof Yup.ValidationError) {
            return error.message;
        }
    }
};

export const isTabFilled = (
    itemLabel: ContactAccordionItems,
    contact: Contact,
    contactExtData: ContactExtData,
    contactType: number,
    isCoBuyerFieldsFilled: boolean,
    values: PartialContact
): boolean => {
    const tabFieldsForItem = tabFields[itemLabel];

    if (tabFieldsForItem?.some((field) => getFieldValidationError(field, values))) {
        return false;
    }

    switch (itemLabel) {
        case ContactAccordionItems.BUYER: {
            const type = contact.type;
            if (!type) return false;
            if (REQUIRED_COMPANY_TYPE_INDEXES.includes(type)) {
                return !!contact.businessName?.trim();
            }
            return !!(contact.firstName?.trim() && contact.lastName?.trim());
        }
        case ContactAccordionItems.CO_BUYER:
            if (contactType !== BUYER_ID || !isCoBuyerFieldsFilled) return false;
            return !!(
                contactExtData.CoBuyer_First_Name?.trim() ||
                contactExtData.CoBuyer_Last_Name?.trim()
            );
        case ContactAccordionItems.CONTACTS:
            return !!(
                contact.email1?.trim() ||
                contact.email2?.trim() ||
                contact.phone1?.trim() ||
                contact.phone2?.trim()
            );
        case ContactAccordionItems.COMPANY:
            return !!(
                contactExtData.Buyer_Emp_Company?.trim() ||
                contactExtData.Buyer_Emp_Contact?.trim() ||
                contactExtData.Buyer_Emp_Ext?.trim() ||
                contactExtData.Buyer_Emp_Phone?.trim()
            );
        case ContactAccordionItems.PROSPECTING:
            return !!(
                contactExtData.Notes?.trim() ||
                contactExtData.PROSPECT1_ID?.trim() ||
                contactExtData.PROSPECT2_ID?.trim()
            );
        default:
            return false;
    }
};

export const getSectionsWithErrors = (errorFields: string[]): string[] => {
    const currentSectionsWithErrors: string[] = [];
    Object.entries(tabFields).forEach(([key, value]) => {
        value.forEach((field) => {
            const hasError = errorFields.some(
                (errorField) => errorField.toLowerCase() === field.toLowerCase()
            );
            if (hasError && !currentSectionsWithErrors.includes(key)) {
                currentSectionsWithErrors.push(key);
            }
        });
    });
    return currentSectionsWithErrors;
};
