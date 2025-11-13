import { Steps } from "primereact/steps";
import { ReactElement, Suspense, useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import {
    ContactAccordionItems,
    ContactItem,
    ContactSection,
} from "dashboard/contacts/common/step-navigation";
import { useNavigate, useParams } from "react-router-dom";
import { BUYER_ID, generalBuyerInfo, generalCoBuyerInfo } from "./general-info";
import { ContactInfoData } from "dashboard/contacts/form/contact-info";
import { useStore } from "store/hooks";
import { useLocation } from "react-router-dom";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { Form, Formik, FormikProps } from "formik";
import { Contact, ContactExtData } from "common/models/contact";
import * as Yup from "yup";
import { Status } from "common/models/base-response";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { DashboardDialog } from "dashboard/common/dialog";
import { ContactMediaData } from "dashboard/contacts/form/media-data";
import { DeleteForm } from "dashboard/contacts/form/delete-form";
import { truncateText } from "common/helpers";
import { Tooltip } from "primereact/tooltip";
import {
    EMAIL_REGEX,
    LETTERS_NUMBERS_SIGNS_REGEX,
    PHONE_NUMBER_REGEX,
    SSN_REGEX,
    SSN_VALID_LENGTH,
} from "common/constants/regex";
import { ERROR_MESSAGES } from "common/constants/error-messages";
import { useToastMessage } from "common/hooks";
import { CONTACTS_PAGE } from "common/constants/links";
const STEP = "step";

export type PartialContact = Pick<
    Contact,
    | "firstName"
    | "middleName"
    | "lastName"
    | "type"
    | "businessName"
    | "email1"
    | "email2"
    | "phone1"
    | "phone2"
> &
    Pick<
        ContactExtData,
        | "CoBuyer_First_Name"
        | "CoBuyer_Middle_Name"
        | "CoBuyer_Last_Name"
        | "Buyer_Emp_Ext"
        | "Buyer_Emp_Phone"
        | "Buyer_SS_Number"
        | "CoBuyer_SS_Number"
    > & {
        separateContact?: boolean;
    };

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

export const REQUIRED_COMPANY_TYPE_INDEXES = [2, 3, 4, 5, 6, 7, 8];

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
            const { CoBuyer_Last_Name, CoBuyer_Middle_Name, type, separateContact } = this.parent;
            if (
                separateContact ||
                (type === BUYER_ID && (CoBuyer_Last_Name?.trim() || CoBuyer_Middle_Name?.trim()))
            ) {
                return !!value?.trim();
            }
            return true;
        })
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("First name"),
            excludeEmptyString: true,
        }),
    CoBuyer_Middle_Name: Yup.string()
        .trim()
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("Middle name"),
        }),
    CoBuyer_Last_Name: Yup.string()
        .trim()
        .test("coBuyerLastNameRequired", ERROR_MESSAGES.REQUIRED, function (value) {
            const { CoBuyer_First_Name, CoBuyer_Middle_Name, type, separateContact } = this.parent;
            if (
                separateContact ||
                (type === BUYER_ID && (CoBuyer_First_Name?.trim() || CoBuyer_Middle_Name?.trim()))
            ) {
                return !!value?.trim();
            }
            return true;
        })
        .matches(LETTERS_NUMBERS_SIGNS_REGEX, {
            message: handleValidationMessage("Last name"),
            excludeEmptyString: true,
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
            if (!value || !value.trim().length) return true;
            const digitsOnly = value.replace(/\D/g, "");
            if (!!digitsOnly.length && digitsOnly.length < SSN_VALID_LENGTH) return false;
            return SSN_REGEX.test(value);
        }
    ),
    separateContact: Yup.boolean(),
});

const DialogBody = (): ReactElement => {
    return (
        <>
            <div className='confirm-header'>
                <i className='pi pi-exclamation-triangle confirm-header__icon' />
                <div className='confirm-header__title'>Required data is missing</div>
            </div>
            <div className='text-center w-full confirm-body'>
                The form cannot be saved as it missing required data.
            </div>
            <div className='text-center w-full confirm-body--bold'>
                Please fill in the required fields and try again.
            </div>
        </>
    );
};

export const ContactForm = observer((): ReactElement => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const { showError, showSuccess } = useToastMessage();

    const [contactSections, setContactSections] = useState<ContactSection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const store = useStore().contactStore;
    const {
        contact,
        contactType,
        contactExtData,
        getContact,
        clearContact,
        saveContact,
        changeContact,
        isContactChanged,
        memoRoute,
        deleteReason,
        activeTab,
        tabLength,
        separateContact,
    } = store;
    const navigate = useNavigate();
    const formikRef = useRef<FormikProps<PartialContact>>(null);
    const [validateOnMount, setValidateOnMount] = useState<boolean>(false);
    const [errorSections, setErrorSections] = useState<string[]>([]);
    const [confirmMessage, setConfirmMessage] = useState<string>("");
    const [confirmTitle, setConfirmTitle] = useState<string>("");
    const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
    const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
    const [isDataMissingConfirm, setIsDataMissingConfirm] = useState<boolean>(false);
    const [confirmActive, setConfirmActive] = useState<boolean>(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false);
    const [deleteActiveIndex, setDeleteActiveIndex] = useState<number>(0);
    const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
    const stepsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let contactsSections = [ContactInfoData];

        switch (contactType) {
            case BUYER_ID:
                contactsSections = [generalCoBuyerInfo, ...contactsSections];
                break;
            default:
                contactsSections = [generalBuyerInfo, ...contactsSections];
                break;
        }

        if (id) {
            contactsSections = [...contactsSections, ContactMediaData];
        }

        const sections = contactsSections.map((sectionData) => new ContactSection(sectionData));
        setContactSections(sections);
        setAccordionSteps(sections.map((item) => item.startIndex));
        const itemsMenuCount = sections.reduce((acc, current) => acc + current.getLength(), -1);
        setItemsMenuCount(itemsMenuCount);
        setDeleteActiveIndex(itemsMenuCount + 1);

        return () => {
            sections.forEach((section) => section.clearCount());
        };
    }, [contactType]);

    useEffect(() => {
        if (id) {
            getContact(id).then((response) => {
                if (response?.status === Status.ERROR) {
                    showError(response?.error as string);
                    navigate(CONTACTS_PAGE.MAIN);
                }
            });
        } else {
            clearContact();
        }
        return () => {
            clearContact();
        };
    }, [id, store]);

    const getUrl = (activeIndex: number) => {
        const currentPath = id ? id : "create";
        return `${CONTACTS_PAGE.EDIT(currentPath)}?step=${activeIndex + 1}`;
    };

    const handleCloseClick = () => {
        const performNavigation = () => {
            if (memoRoute) {
                navigate(memoRoute);
                store.memoRoute = "";
            } else {
                navigate(CONTACTS_PAGE.MAIN);
            }
        };

        if (isContactChanged) {
            setConfirmTitle("Quit Editing?");
            setConfirmMessage(
                "Are you sure you want to leave this page? All unsaved data will be lost."
            );
            setConfirmAction(() => performNavigation);
            setIsConfirmVisible(true);
        } else {
            performNavigation();
        }
    };

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isContactChanged) {
                event.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isContactChanged]);

    useEffect(() => {
        accordionSteps.forEach((step, index) => {
            stepActiveIndex >= step && setAccordionActiveIndex([index]);
        });
        if (stepsRef.current) {
            const activeStep = stepsRef.current.querySelector("[aria-selected='true']");
            if (activeStep) {
                activeStep.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [stepActiveIndex, stepsRef.current]);

    const handleSaveContactForm = () => {
        formikRef.current?.validateForm().then(async (errors) => {
            const coBuyerValidationErrors: Record<string, string> = {};

            if (REQUIRED_COMPANY_TYPE_INDEXES.includes(contact.type)) {
                changeContact([
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
                let response;

                if (store.separateContact) {
                    response = await store.createSeparateCoBuyerContact();
                } else {
                    response = await saveContact();
                }

                if (response && response.status === Status.OK) {
                    if (memoRoute) {
                        navigate(memoRoute);
                        store.memoRoute = "";
                    } else {
                        navigate(CONTACTS_PAGE.MAIN);
                    }
                    showSuccess("Contact saved successfully");
                } else {
                    if (response && Array.isArray(response)) {
                        response.forEach((error) => {
                            const serverField = error.field.toLowerCase();
                            const formField =
                                Object.keys(formikRef.current?.values || {}).find(
                                    (field) => field.toLowerCase() === serverField
                                ) || error.field;

                            formikRef.current?.setErrors({ [formField]: error.message });
                            formikRef.current?.setFieldTouched(formField, true, false);
                            showError(error.message);
                        });

                        const serverErrorFields = response.map((error) =>
                            error.field.toLowerCase()
                        );
                        const currentSectionsWithErrors: string[] = [];
                        Object.entries(tabFields).forEach(([key, value]) => {
                            value.forEach((field) => {
                                const hasError = serverErrorFields.some(
                                    (errorField) => errorField === field.toLowerCase()
                                );
                                if (hasError && !currentSectionsWithErrors.includes(key)) {
                                    currentSectionsWithErrors.push(key);
                                }
                            });
                        });
                        setErrorSections(currentSectionsWithErrors);
                    } else {
                        showError(response.error);
                    }
                }
            } else {
                setValidateOnMount(true);
                formikRef.current?.setErrors(allErrors);

                Object.keys(allErrors).forEach((field) => {
                    formikRef.current?.setFieldTouched(field, true, false);
                });

                const sectionsWithErrors = Object.keys(allErrors);
                const currentSectionsWithErrors: string[] = [];
                Object.entries(tabFields).forEach(([key, value]) => {
                    value.forEach((field) => {
                        const hasError = sectionsWithErrors.some(
                            (errorField) => errorField.toLowerCase() === field.toLowerCase()
                        );
                        if (hasError && !currentSectionsWithErrors.includes(key)) {
                            currentSectionsWithErrors.push(key);
                        }
                    });
                });

                setErrorSections(currentSectionsWithErrors);

                const hasCoBuyerMiddleNameOnly =
                    contactType === BUYER_ID &&
                    contactExtData.CoBuyer_Middle_Name?.trim() &&
                    !contactExtData.CoBuyer_First_Name?.trim() &&
                    !contactExtData.CoBuyer_Last_Name?.trim();

                const hasMainMiddleNameOnly =
                    contact.middleName?.trim() &&
                    !contact.firstName?.trim() &&
                    !contact.lastName?.trim();

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
            }
        });
    };

    const handleOnBackClick = () => {
        if (activeTab !== null && activeTab && activeTab > 0) {
            store.activeTab = activeTab - 1;
        } else {
            setStepActiveIndex((prev) => {
                const newStep = prev - 1;
                navigate(getUrl(newStep));
                return newStep;
            });
        }
    };

    const handleOnNextClick = () => {
        if (activeTab !== null && activeTab < tabLength - 1) {
            store.activeTab = activeTab + 1;
        } else {
            setStepActiveIndex((prev) => {
                const newStep = prev + 1;
                navigate(getUrl(newStep));
                return newStep;
            });
        }
    };

    const stepAccordionHeader = (section: ContactSection) => {
        const validTabsCount = section.items.reduce((count, item) => {
            const tabFieldsForItem = tabFields[item.itemLabel];

            const hasErrors = tabFieldsForItem?.some(
                (fieldName) => formikRef.current?.errors[fieldName]
            );

            return hasErrors ? count : count + 1;
        }, 0);

        const totalTabsCount = section.items.length;

        return (
            <div className='p-0'>
                {section.label}
                <span className='ml-2 text--green'>
                    ({validTabsCount}/{totalTabsCount})
                </span>
            </div>
        );
    };

    return (
        <Suspense>
            <div className='grid relative'>
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={handleCloseClick}
                />
                <div className='col-12'>
                    <div className='card contact'>
                        <div className='card-header'>
                            <h2 className='card-header__title uppercase m-0 pr-2'>
                                {id ? "Edit" : "Create new"} contact
                            </h2>
                            {id && (
                                <div className='card-header-info'>
                                    <Tooltip target='.tooltip-target' />

                                    {(contact.firstName || contact.lastName) && (
                                        <>
                                            Full Name
                                            <span
                                                className='card-header-info__data tooltip-target'
                                                data-pr-tooltip={`${contact.firstName || ""} ${contact.lastName || ""}`}
                                                data-pr-position='top'
                                            >
                                                {truncateText(
                                                    `${contact.firstName || ""} ${contact.lastName || ""}`
                                                )}
                                            </span>
                                        </>
                                    )}

                                    {contact?.businessName && (
                                        <>
                                            Company name
                                            <span
                                                className='card-header-info__data tooltip-target'
                                                data-pr-tooltip={contact.businessName}
                                                data-pr-position='top'
                                            >
                                                {truncateText(contact.businessName)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className='card-content contact__card'>
                            <div className='grid flex-nowrap card-content__wrapper'>
                                <div className='p-0' ref={stepsRef}>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        multiple
                                        className='contact__accordion'
                                    >
                                        {contactSections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={stepAccordionHeader(section)}
                                            >
                                                <Steps
                                                    model={section.items.map(
                                                        ({ itemLabel, template }, idx) => ({
                                                            label: itemLabel,
                                                            template,
                                                            command: () => {
                                                                navigate(
                                                                    getUrl(section.startIndex + idx)
                                                                );
                                                            },
                                                            className: errorSections.length
                                                                ? errorSections.includes(itemLabel)
                                                                    ? "section-invalid"
                                                                    : "section-valid"
                                                                : "",
                                                        })
                                                    )}
                                                    readOnly={false}
                                                    activeIndex={
                                                        stepActiveIndex - section.startIndex
                                                    }
                                                    onSelect={(e) =>
                                                        setStepActiveIndex(
                                                            e.index + section.startIndex
                                                        )
                                                    }
                                                    className='vertical-step-menu'
                                                    pt={{
                                                        menu: { className: "flex-column w-full" },
                                                        step: {
                                                            className: "border-circle contact-step",
                                                        },
                                                    }}
                                                />
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                    {id && (
                                        <Button
                                            icon='pi pi-times'
                                            className='p-button gap-2 inventory__delete-nav w-full'
                                            severity='danger'
                                            onClick={() => setStepActiveIndex(deleteActiveIndex)}
                                        >
                                            Delete contact
                                        </Button>
                                    )}
                                </div>
                                <div className='w-full flex flex-column p-0'>
                                    <div className='flex flex-grow-1'>
                                        <Formik
                                            innerRef={formikRef}
                                            validationSchema={ContactFormSchema}
                                            initialValues={
                                                {
                                                    firstName: contact?.firstName || "",
                                                    middleName: contact?.middleName || "",
                                                    lastName: contact?.lastName || "",
                                                    type: contact?.type || null,
                                                    businessName: contact?.businessName || "",
                                                    email1: contact?.email1 || "",
                                                    email2: contact?.email2 || "",
                                                    phone1:
                                                        contact?.phone1?.replace(/[^0-9]/g, "") ||
                                                        "",
                                                    phone2:
                                                        contact?.phone2?.replace(/[^0-9]/g, "") ||
                                                        "",
                                                    Buyer_Emp_Ext:
                                                        contactExtData.Buyer_Emp_Ext || "",
                                                    Buyer_Emp_Phone:
                                                        contactExtData.Buyer_Emp_Phone || "",
                                                    CoBuyer_First_Name:
                                                        contactExtData.CoBuyer_First_Name || "",
                                                    CoBuyer_Last_Name:
                                                        contactExtData.CoBuyer_Last_Name || "",
                                                    Buyer_SS_Number:
                                                        contactExtData.Buyer_SS_Number || "",
                                                    CoBuyer_SS_Number:
                                                        contactExtData.CoBuyer_SS_Number || "",
                                                    separateContact: separateContact || false,
                                                } as PartialContact
                                            }
                                            enableReinitialize
                                            validateOnChange={false}
                                            validateOnBlur={false}
                                            validateOnMount={validateOnMount}
                                            onSubmit={() => {
                                                setValidateOnMount(false);
                                            }}
                                        >
                                            <Form name='contactForm' className='w-full'>
                                                {contactSections.map((section) =>
                                                    section.items.map((item: ContactItem) => {
                                                        return (
                                                            <div
                                                                key={item.itemIndex}
                                                                className={`${
                                                                    stepActiveIndex ===
                                                                    item.itemIndex
                                                                        ? "block contact-form"
                                                                        : "hidden"
                                                                }`}
                                                            >
                                                                <div className='contact-form__title uppercase'>
                                                                    {item.itemLabel}
                                                                </div>
                                                                {stepActiveIndex ===
                                                                    item.itemIndex && (
                                                                    <Suspense
                                                                        fallback={
                                                                            <Loader className='contact-form__loader' />
                                                                        }
                                                                    >
                                                                        {item.component}
                                                                    </Suspense>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </Form>
                                        </Formik>
                                        {stepActiveIndex === deleteActiveIndex && (
                                            <DeleteForm
                                                attemptedSubmit={attemptedSubmit}
                                                isDeleteConfirm={isDeleteConfirm}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-content-end gap-3 mt-5 mr-3 form-nav'>
                                <Button
                                    onClick={handleOnBackClick}
                                    className='form-nav__button'
                                    outlined
                                    disabled={stepActiveIndex <= 0 && !activeTab}
                                    severity={
                                        stepActiveIndex <= 0 && !activeTab ? "secondary" : "success"
                                    }
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleOnNextClick}
                                    disabled={stepActiveIndex >= itemsMenuCount}
                                    severity={
                                        stepActiveIndex >= itemsMenuCount ? "secondary" : "success"
                                    }
                                    className='form-nav__button'
                                    outlined
                                >
                                    Next
                                </Button>
                                {stepActiveIndex === deleteActiveIndex ? (
                                    <Button
                                        onClick={() =>
                                            deleteReason.length
                                                ? setConfirmActive(true)
                                                : setAttemptedSubmit(true)
                                        }
                                        disabled={!deleteReason.length}
                                        {...(!deleteReason.length && { severity: "secondary" })}
                                        className='form-nav__button form-nav__button--danger'
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <Button
                                        className='form-nav__button'
                                        type='button'
                                        onClick={handleSaveContactForm}
                                        disabled={!isContactChanged}
                                        severity={isContactChanged ? "success" : "secondary"}
                                    >
                                        {id ? "Update" : "Save"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isConfirmVisible ? (
                <ConfirmModal
                    visible={!!isConfirmVisible}
                    title={confirmTitle}
                    icon='pi-exclamation-triangle'
                    bodyMessage={confirmMessage}
                    confirmAction={confirmAction}
                    draggable={false}
                    rejectLabel='Cancel'
                    acceptLabel='Confirm'
                    resizable={false}
                    className='contact-confirm-dialog'
                    onHide={() => setIsConfirmVisible(false)}
                />
            ) : (
                <ConfirmModal
                    visible={confirmActive}
                    draggable={false}
                    position='top'
                    className='contact-delete-dialog'
                    bodyMessage='Do you really want to delete this contact? 
                This process cannot be undone.'
                    rejectLabel='Cancel'
                    acceptLabel='Delete'
                    confirmAction={() => setIsDeleteConfirm(true)}
                    onHide={() => setConfirmActive(false)}
                />
            )}

            <DashboardDialog
                visible={!!isDataMissingConfirm}
                className='contact-missed-data-dialog'
                onHide={() => setIsDataMissingConfirm(false)}
                footer='Got it'
                action={() => setIsDataMissingConfirm(false)}
            >
                <DialogBody />
            </DashboardDialog>
        </Suspense>
    );
});
