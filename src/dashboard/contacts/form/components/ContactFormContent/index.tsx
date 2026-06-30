import { ReactElement, RefObject } from "react";
import { Form, Formik, FormikProps } from "formik";
import { Contact, ContactExtData } from "common/models/contact";
import { ContactSection } from "dashboard/contacts/common/step-navigation";
import { DeleteForm } from "dashboard/contacts/form/delete-form";
import { ContactFormSchema, buildFormValues } from "dashboard/contacts/form/common/validation";
import { PartialContact } from "dashboard/contacts/form/common/types";
import { EntityFormSteps } from "dashboard/common/entity-form-layout";

interface ContactFormContentProps {
    formikRef: RefObject<FormikProps<PartialContact> | null>;
    contactSections: ContactSection[];
    stepActiveIndex: number;
    deleteActiveIndex: number;
    validateOnMount: boolean;
    contact: Contact;
    contactExtData: ContactExtData;
    canDelete: boolean;
    attemptedSubmit: boolean;
    isDeleteConfirm: boolean;
    onSubmit: () => void;
}

export default function ContactFormContent({
    formikRef,
    contactSections,
    stepActiveIndex,
    deleteActiveIndex,
    validateOnMount,
    contact,
    contactExtData,
    canDelete,
    attemptedSubmit,
    isDeleteConfirm,
    onSubmit,
}: ContactFormContentProps): ReactElement {
    return (
        <Formik
            innerRef={formikRef}
            validationSchema={ContactFormSchema}
            initialValues={buildFormValues(contact, contactExtData)}
            enableReinitialize
            validateOnChange={false}
            validateOnBlur={false}
            validateOnMount={validateOnMount}
            onSubmit={onSubmit}
        >
            <Form name='contactForm' className='w-full'>
                <EntityFormSteps
                    sections={contactSections}
                    stepActiveIndex={stepActiveIndex}
                    panelClassName='entity-form-panel contact-form'
                    titleClassName='entity-form-panel__title contact-form__title'
                >
                    {stepActiveIndex === deleteActiveIndex && canDelete && (
                        <DeleteForm
                            attemptedSubmit={attemptedSubmit}
                            isDeleteConfirm={isDeleteConfirm}
                        />
                    )}
                </EntityFormSteps>
            </Form>
        </Formik>
    );
}
