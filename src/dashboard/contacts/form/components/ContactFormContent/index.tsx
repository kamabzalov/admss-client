import { ReactElement, RefObject, Suspense } from "react";
import { Form, Formik, FormikProps } from "formik";
import { Contact, ContactExtData } from "common/models/contact";
import { Loader } from "dashboard/common/loader";
import { ContactSection } from "dashboard/contacts/common/step-navigation";
import { DeleteForm } from "dashboard/contacts/form/delete-form";
import { ContactFormSchema, buildFormValues } from "dashboard/contacts/form/common/validation";
import { PartialContact } from "dashboard/contacts/form/common/types";

interface ContactFormContentProps {
    formikRef: RefObject<FormikProps<PartialContact>>;
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
        <div className='w-full flex flex-column p-0'>
            <div className='flex flex-grow-1'>
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
                        {contactSections.map((section) =>
                            section.items.map((item) => (
                                <div
                                    key={item.itemIndex}
                                    className={`${
                                        stepActiveIndex === item.itemIndex
                                            ? "block contact-form"
                                            : "hidden"
                                    }`}
                                >
                                    <div className='contact-form__title uppercase heading-condensed'>
                                        {item.itemLabel}
                                    </div>
                                    {stepActiveIndex === item.itemIndex && (
                                        <Suspense
                                            fallback={<Loader className='contact-form__loader' />}
                                        >
                                            {item.component}
                                        </Suspense>
                                    )}
                                </div>
                            ))
                        )}
                    </Form>
                </Formik>
                {stepActiveIndex === deleteActiveIndex && canDelete && (
                    <DeleteForm
                        attemptedSubmit={attemptedSubmit}
                        isDeleteConfirm={isDeleteConfirm}
                    />
                )}
            </div>
        </div>
    );
}
