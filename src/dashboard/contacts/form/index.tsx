import { ReactElement, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ContactSection,
    createContactSections,
    getContactMenuCount,
    resetFormStepSectionCounters,
} from "dashboard/contacts/common/step-navigation";
import {
    FormStepAccordion,
    FormStepItem,
    SectionHeaderWithCount,
} from "dashboard/common/form-stepper";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    BUYER_ID,
    generalBuyerInfo,
    generalCoBuyerInfo,
} from "dashboard/contacts/form/general-info";
import { ContactInfoData } from "dashboard/contacts/form/contact-info";
import { useStore } from "store/hooks";
import { observer } from "mobx-react-lite";
import { FormikProps } from "formik";
import { ContactAccordionItems } from "dashboard/contacts/common/step-navigation";
import { Status } from "common/models/base-response";
import { ContactMediaData } from "dashboard/contacts/form/media-data";
import { usePermissions, useToastMessage } from "common/hooks";
import { CONTACTS_PAGE } from "common/constants/links";
import { FORM_STEP_PARAM } from "dashboard/contacts/form/common/constants";
import { buildFormValues, isTabFilled } from "dashboard/contacts/form/common/validation";
import { PartialContact } from "dashboard/contacts/form/common/types";
import ContactFormHeader from "dashboard/contacts/form/components/ContactFormHeader";
import ContactFormContent from "dashboard/contacts/form/components/ContactFormContent";
import ContactFormFooter from "dashboard/contacts/form/components/ContactFormFooter";
import {
    EntityFormBody,
    EntityFormCard,
    EntityFormContent as EntityFormContentArea,
    EntityFormDeleteNavButton,
    EntityFormPage,
} from "dashboard/common/entity-form-layout";
import ContactFormDialogs from "dashboard/contacts/form/components/ContactFormDialogs";
import ContactValidationDialog, {
    ValidationErrorType,
} from "dashboard/contacts/form/components/ContactValidationDialog";
import { useContactFormSave } from "dashboard/contacts/form/hooks/useContactFormSave";

export type { PartialContact } from "dashboard/contacts/form/common/types";
export { REQUIRED_COMPANY_TYPE_INDEXES } from "dashboard/contacts/form/common/constants";
export { ContactFormSchema } from "dashboard/contacts/form/common/validation";

export const ContactForm = observer((): ReactElement => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const { contactPermissions } = usePermissions();
    const { showError, showSuccess } = useToastMessage();

    const [contactSections, setContactSections] = useState<ContactSection[]>([]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const tabParam = searchParams.get(FORM_STEP_PARAM)
        ? Number(searchParams.get(FORM_STEP_PARAM)) - 1
        : 0;
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([]);
    const store = useStore().contactStore;
    const {
        contact,
        contactType,
        contactExtData,
        getContact,
        clearContact,
        isContactChanged,
        isCoBuyerFieldsFilled,
        memoRoute,
        deleteReason,
        activeTab,
        tabLength,
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
    const [validationErrorType, setValidationErrorType] = useState<ValidationErrorType>(
        ValidationErrorType.MISSING
    );
    const [confirmActive, setConfirmActive] = useState<boolean>(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false);
    const [deleteActiveIndex, setDeleteActiveIndex] = useState<number>(0);
    const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
    const stepsRef = useRef<HTMLDivElement>(null);
    const isCreateAccordionInitialized = useRef(false);

    const { handleSaveContactForm } = useContactFormSave({
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
    });

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

        const sections = createContactSections(contactsSections);
        setContactSections(sections);
        const menuCount = getContactMenuCount(sections);
        setItemsMenuCount(menuCount);
        setDeleteActiveIndex(menuCount + 1);

        return () => {
            resetFormStepSectionCounters();
        };
    }, [contactType, id]);

    useEffect(() => {
        if (id || contactSections.length === 0 || isCreateAccordionInitialized.current) {
            return;
        }

        setAccordionActiveIndex(contactSections.map((_, index) => index));
        isCreateAccordionInitialized.current = true;
    }, [id, contactSections]);

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

    const handleStepChange = useCallback(
        (globalIndex: number) => {
            setStepActiveIndex(globalIndex);
            navigate(getUrl(globalIndex));
        },
        [id, navigate]
    );

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

    const resolveStepClassName = (item: FormStepItem, globalIndex: number): string => {
        const formValues = buildFormValues(contact, contactExtData);
        const isFilled = isTabFilled(
            item.itemLabel as ContactAccordionItems,
            contact,
            contactExtData,
            contactType,
            isCoBuyerFieldsFilled,
            formValues
        );

        if (errorSections.includes(item.itemLabel)) {
            return "section-invalid";
        }

        if (isFilled) {
            return "section-valid";
        }

        if (globalIndex <= stepActiveIndex) {
            return "section-in-progress";
        }

        return "";
    };

    const accordionFooter = useMemo(() => {
        if (!id) {
            return undefined;
        }

        return (
            <EntityFormDeleteNavButton
                disabled={!contactPermissions.canDelete()}
                onClick={() =>
                    contactPermissions.canDelete() && setStepActiveIndex(deleteActiveIndex)
                }
            >
                Delete contact
            </EntityFormDeleteNavButton>
        );
    }, [id, contactPermissions, deleteActiveIndex]);

    const renderSectionHeader = (section: ContactSection) => {
        const formValues = buildFormValues(contact, contactExtData);
        const filledTabsCount = section.items.reduce(
            (count, item) =>
                isTabFilled(
                    item.itemLabel as ContactAccordionItems,
                    contact,
                    contactExtData,
                    contactType,
                    isCoBuyerFieldsFilled,
                    formValues
                )
                    ? count + 1
                    : count,
            0
        );

        return (
            <SectionHeaderWithCount
                label={section.label}
                filledCount={filledTabsCount}
                totalCount={section.items.length}
            />
        );
    };

    return (
        <Suspense>
            <EntityFormPage onClose={handleCloseClick}>
                <EntityFormCard entityClassName='contact'>
                    <ContactFormHeader id={id} contact={contact} />
                    <EntityFormContentArea>
                        <EntityFormBody
                            sidebar={
                                <FormStepAccordion
                                    sections={contactSections}
                                    stepActiveIndex={stepActiveIndex}
                                    accordionActiveIndex={accordionActiveIndex}
                                    onAccordionChange={setAccordionActiveIndex}
                                    onStepChange={handleStepChange}
                                    errorSections={errorSections}
                                    resolveStepClassName={resolveStepClassName}
                                    accordionClassName='entity-form-accordion'
                                    stepClassName='border-circle contact-step'
                                    renderSectionHeader={renderSectionHeader}
                                    navigationRef={stepsRef}
                                    expandMode='sync-with-step'
                                    wrapperClassName='p-0'
                                    footer={accordionFooter}
                                />
                            }
                        >
                            <ContactFormContent
                                formikRef={formikRef}
                                contactSections={contactSections}
                                stepActiveIndex={stepActiveIndex}
                                deleteActiveIndex={deleteActiveIndex}
                                validateOnMount={validateOnMount}
                                contact={contact}
                                contactExtData={contactExtData}
                                canDelete={contactPermissions.canDelete()}
                                attemptedSubmit={attemptedSubmit}
                                isDeleteConfirm={isDeleteConfirm}
                                onSubmit={() => setValidateOnMount(false)}
                            />
                        </EntityFormBody>
                        <ContactFormFooter
                            stepActiveIndex={stepActiveIndex}
                            itemsMenuCount={itemsMenuCount}
                            deleteActiveIndex={deleteActiveIndex}
                            activeTab={activeTab}
                            canDelete={contactPermissions.canDelete()}
                            deleteReason={deleteReason}
                            isContactChanged={isContactChanged}
                            hasContactType={!!contact.type}
                            isEditMode={!!id}
                            onBack={handleOnBackClick}
                            onNext={handleOnNextClick}
                            onSave={handleSaveContactForm}
                            onDeleteClick={() =>
                                deleteReason.length
                                    ? setConfirmActive(true)
                                    : setAttemptedSubmit(true)
                            }
                        />
                    </EntityFormContentArea>
                </EntityFormCard>
            </EntityFormPage>
            <ContactFormDialogs
                isConfirmVisible={isConfirmVisible}
                confirmTitle={confirmTitle}
                confirmMessage={confirmMessage}
                confirmAction={confirmAction}
                onHideConfirm={() => setIsConfirmVisible(false)}
                confirmActive={confirmActive}
                onHideDeleteConfirm={() => setConfirmActive(false)}
                onConfirmDelete={() => setIsDeleteConfirm(true)}
            />
            <ContactValidationDialog
                visible={!!isDataMissingConfirm}
                errorType={validationErrorType}
                onHide={() => setIsDataMissingConfirm(false)}
            />
        </Suspense>
    );
});
