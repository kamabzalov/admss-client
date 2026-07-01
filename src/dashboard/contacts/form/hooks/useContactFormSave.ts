import { RefObject } from "react";
import { FormikProps } from "formik";
import { NavigateFunction } from "react-router-dom";
import { Status } from "common/models/base-response";
import { ContactStore } from "store/stores/contact";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { CONTACTS_PAGE } from "common/constants/links";
import { BUYER_ID } from "dashboard/contacts/form/general-info";
import { REQUIRED_COMPANY_TYPE_INDEXES } from "dashboard/contacts/form/common/constants";
import { getSectionsWithErrors } from "dashboard/contacts/form/common/validation";
import { PartialContact } from "dashboard/contacts/form/common/types";
import { ValidationErrorType } from "dashboard/contacts/form/components/ContactValidationDialog";

interface UseContactFormSaveParams {
    formikRef: RefObject<FormikProps<PartialContact> | null>;
    store: ContactStore;
    contact: ContactStore["contact"];
    contactExtData: ContactStore["contactExtData"];
    contactType: number;
    memoRoute: string;
    navigate: NavigateFunction;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
    setValidateOnMount: (value: boolean) => void;
    setErrorSections: (sections: string[]) => void;
    setValidationErrorType: (type: ValidationErrorType) => void;
    setIsDataMissingConfirm: (value: boolean) => void;
    setIsConfirmVisible: (value: boolean) => void;
    setConfirmAction: (action: () => void) => void;
}

export const useContactFormSave = ({
    formikRef,
    store,
    contact,
    contactExtData,
    contactType,
    memoRoute,
    navigate,
    showError,
    showSuccess,
    setValidateOnMount,
    setErrorSections,
    setValidationErrorType,
    setIsDataMissingConfirm,
    setIsConfirmVisible,
    setConfirmAction,
}: UseContactFormSaveParams) => {
    const handleSaveContactForm = () => {
        formikRef.current?.validateForm().then(async (errors) => {
            const coBuyerValidationErrors: Record<string, string> = {};

            if (REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type)) {
                store.changeContact([
                    ["firstName", ""],
                    ["lastName", ""],
                    ["middleName", ""],
                ]);
            }

            if (store.isCoBuyerFieldsFilled && contactType === BUYER_ID) {
                const hasCoBuyerName =
                    contactExtData.CoBuyer_First_Name?.trim() ||
                    contactExtData.CoBuyer_Last_Name?.trim();

                if (!hasCoBuyerName) {
                    coBuyerValidationErrors.CoBuyer_First_Name = ERROR_MESSAGES.REQUIRED;
                    coBuyerValidationErrors.CoBuyer_Last_Name = ERROR_MESSAGES.REQUIRED;
                }

                if (!hasCoBuyerName && !contactExtData.CoBuyer_Emp_Company?.trim()) {
                    coBuyerValidationErrors.CoBuyer_Emp_Company = ERROR_MESSAGES.REQUIRED;
                }
            }

            const allErrors = { ...errors, ...coBuyerValidationErrors };

            if (!Object.keys(allErrors).length) {
                if (contact.type !== BUYER_ID) {
                    store.changeContactExtData([
                        ["CoBuyer_First_Name", ""],
                        ["CoBuyer_Middle_Name", ""],
                        ["CoBuyer_Last_Name", ""],
                        ["CoBuyer_SS_Number", ""],
                    ]);
                }

                const response = await store.saveContact();

                if (response && response.status === Status.OK) {
                    if (memoRoute) {
                        navigate(memoRoute);
                        store.memoRoute = "";
                    } else {
                        navigate(CONTACTS_PAGE.MAIN);
                    }
                    showSuccess("Contact saved successfully");
                } else if (response && Array.isArray(response)) {
                    handleServerValidationErrors(response);
                } else {
                    showError(response?.error || "Failed to save contact");
                }
            } else {
                handleClientValidationErrors(allErrors);
            }
        });
    };

    const handleServerValidationErrors = (response: Array<{ field: string; message: string }>) => {
        const formErrors: Record<string, string> = {};
        let ssnDuplicateErrorShown = false;
        const touchedFields: string[] = [];

        response.forEach((error) => {
            const serverField = error.field.toLowerCase();
            const formField =
                Object.keys(formikRef.current?.values || {}).find(
                    (field) => field.toLowerCase() === serverField
                ) || error.field;

            const isSSNDuplicateError =
                (error.field === "Buyer_SS_Number" || error.field === "CoBuyer_SS_Number") &&
                error.message.includes("must not be equal");

            if (isSSNDuplicateError) {
                if (!ssnDuplicateErrorShown) {
                    formErrors.Buyer_SS_Number = ERROR_MESSAGES.SSN_DUPLICATE;
                    formErrors.CoBuyer_SS_Number = ERROR_MESSAGES.SSN_DUPLICATE;
                    touchedFields.push("Buyer_SS_Number", "CoBuyer_SS_Number");
                    showError(ERROR_MESSAGES.SSN_DUPLICATE);
                    ssnDuplicateErrorShown = true;
                }
            } else {
                formErrors[formField] = error.message;
                touchedFields.push(formField);
                showError(error.message);
            }
        });

        if (Object.keys(formErrors).length > 0) {
            formikRef.current?.setErrors(formErrors);
            touchedFields.forEach((field) => {
                formikRef.current?.setFieldTouched(field, true, false);
            });
        }

        const serverErrorFields = response
            .map((error) => {
                const isSSNDuplicateError =
                    (error.field === "Buyer_SS_Number" || error.field === "CoBuyer_SS_Number") &&
                    error.message.includes("must not be equal");
                if (isSSNDuplicateError) {
                    return ["buyer_ss_number", "cobuyer_ss_number"];
                }
                return error.field.toLowerCase();
            })
            .flat();

        setErrorSections(
            getSectionsWithErrors(serverErrorFields.map((field) => field.toLowerCase()))
        );
    };

    const handleClientValidationErrors = (allErrors: Record<string, string>) => {
        setValidateOnMount(true);
        formikRef.current?.setErrors(allErrors);

        Object.keys(allErrors).forEach((field) => {
            formikRef.current?.setFieldTouched(field, true, false);
        });

        setErrorSections(getSectionsWithErrors(Object.keys(allErrors)));

        const hasFormatErrors = Object.values(allErrors).some(
            (error) => error !== ERROR_MESSAGES.REQUIRED
        );
        setValidationErrorType(
            hasFormatErrors ? ValidationErrorType.INVALID : ValidationErrorType.MISSING
        );

        const hasCoBuyerMiddleNameOnly =
            contactType === BUYER_ID &&
            contactExtData.CoBuyer_Middle_Name?.trim() &&
            !contactExtData.CoBuyer_First_Name?.trim() &&
            !contactExtData.CoBuyer_Last_Name?.trim();

        const hasMainMiddleNameOnly =
            contact.middleName?.trim() && !contact.firstName?.trim() && !contact.lastName?.trim();

        const hasBusinessNameOnly =
            contact.businessName?.trim() &&
            !contact.firstName?.trim() &&
            !contact.lastName?.trim() &&
            REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type);

        if (hasCoBuyerMiddleNameOnly || hasMainMiddleNameOnly || hasBusinessNameOnly) {
            setConfirmAction(() => {
                setIsConfirmVisible(false);
                setIsDataMissingConfirm(true);
            });
            setIsConfirmVisible(true);
        } else {
            setIsDataMissingConfirm(true);
        }
    };

    return { handleSaveContactForm };
};
