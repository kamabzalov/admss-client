/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { ReactElement, Suspense, useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ContactAccordionItems, ContactItem, ContactSection } from "../common/step-navigation";
import { useNavigate, useParams } from "react-router-dom";
import { GeneralInfoData } from "./general-info";
import { ContactInfoData } from "./contact-info";
import { ContactMediaData } from "./media-data";
import { useStore } from "store/hooks";
import { useLocation } from "react-router-dom";
import { Loader } from "dashboard/common/loader";
import { observer } from "mobx-react-lite";
import { Form, Formik, FormikProps } from "formik";
import { Contact, ContactExtData } from "common/models/contact";
import * as Yup from "yup";
import { useToast } from "dashboard/common/toast";
const STEP = "step";

export type PartialContact = Pick<
    Contact,
    "firstName" | "lastName" | "type" | "companyName" | "email1" | "email2" | "phone1" | "phone2"
> &
    Pick<ContactExtData, "Buyer_Emp_Ext" | "Buyer_Emp_Phone">;

const tabFields: Partial<Record<ContactAccordionItems, (keyof PartialContact)[]>> = {
    [ContactAccordionItems.GENERAL]: ["firstName", "lastName", "type", "companyName"],
    [ContactAccordionItems.CONTACTS]: ["email1", "email2", "phone1", "phone2"],
    [ContactAccordionItems.COMPANY]: ["Buyer_Emp_Ext", "Buyer_Emp_Phone"],
};

export const REQUIRED_COMPANY_TYPE_INDEXES = [2, 3, 4, 5, 6, 7, 8];

export const ContactFormSchema: Yup.ObjectSchema<Partial<PartialContact>> = Yup.object().shape({
    firstName: Yup.string().trim().required("Data is required."),
    lastName: Yup.string().trim().required("Data is required."),
    type: Yup.number().default(0).required("Data is required."),
    email1: Yup.string().email("Invalid email address."),
    email2: Yup.string().email("Invalid email address."),
    phone1: Yup.string().matches(/^[\d]{10,13}$/, {
        message: "Invalid phone number.",
        excludeEmptyString: false,
    }),
    phone2: Yup.string().matches(/^[\d]{10,13}$/, {
        message: "Invalid phone number.",
        excludeEmptyString: false,
    }),
    companyName: Yup.string()
        .trim()
        .when("type", ([type]) => {
            return REQUIRED_COMPANY_TYPE_INDEXES.includes(type)
                ? Yup.string().trim().required("Data is required.")
                : Yup.string().trim();
        }),
    Buyer_Emp_Ext: Yup.string().email("Invalid email address."),
    Buyer_Emp_Phone: Yup.string().matches(/^[\d]{10,13}$/, {
        message: "Invalid phone number.",
        excludeEmptyString: false,
    }),
});

export const ContactForm = observer((): ReactElement => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const toast = useToast();

    const [contactSections, setContactSections] = useState<ContactSection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const store = useStore().contactStore;
    const { contact, contactExtData, getContact, clearContact, saveContact, memoRoute } = store;
    const navigate = useNavigate();
    const formikRef = useRef<FormikProps<PartialContact>>(null);
    const [validateOnMount, setValidateOnMount] = useState<boolean>(false);
    const [errorSections, setErrorSections] = useState<string[]>([]);

    useEffect(() => {
        const contactSections: any[] = [GeneralInfoData, ContactInfoData];
        if (id) {
            getContact(id);
            contactSections.splice(2, 0, ContactMediaData);
        } else {
            clearContact();
        }
        const sections = contactSections.map((sectionData) => new ContactSection(sectionData));
        setContactSections(sections);
        setAccordionSteps(sections.map((item) => item.startIndex));
        const itemsMenuCount = sections.reduce((acc, current) => acc + current.getLength(), -1);
        setItemsMenuCount(itemsMenuCount);
        return () => {
            clearContact();
            sections.forEach((section) => section.clearCount());
        };
    }, [id, store]);

    const getUrl = (activeIndex: number) => {
        const currentPath = id ? id : "create";
        return `/dashboard/contacts/${currentPath}?step=${activeIndex + 1}`;
    };

    useEffect(() => {
        accordionSteps.forEach((step, index) => {
            if (step - 1 < stepActiveIndex) {
                return setAccordionActiveIndex((prev) => {
                    const updatedArray = Array.isArray(prev) ? [...prev] : [0];
                    updatedArray[index] = index;
                    return updatedArray;
                });
            }
        });
    }, [stepActiveIndex]);

    const handleSaveContactForm = () => {
        formikRef.current?.validateForm().then((errors) => {
            if (!Object.keys(errors).length) {
                formikRef.current?.submitForm();
            } else {
                setValidateOnMount(true);

                const sectionsWithErrors = Object.keys(errors);
                const currentSectionsWithErrors: string[] = [];
                Object.entries(tabFields).forEach(([key, value]) => {
                    value.forEach((field) => {
                        if (
                            sectionsWithErrors.includes(field) &&
                            !currentSectionsWithErrors.includes(key)
                        ) {
                            currentSectionsWithErrors.push(key);
                        }
                    });
                });
                setErrorSections(currentSectionsWithErrors);

                toast.current?.show({
                    severity: "error",
                    summary: "Validation Error",
                    detail: "Please fill in all required fields.",
                });
            }
        });
    };

    return (
        <Suspense>
            <div className='grid relative'>
                <Button
                    icon='pi pi-times'
                    className='p-button close-button'
                    onClick={() => navigate("/dashboard/contacts")}
                />
                <div className='col-12'>
                    <div className='card contact'>
                        <div className='card-header'>
                            <h2 className='card-header__title uppercase m-0 pr-2'>
                                {id ? "Edit" : "Create new"} contact
                            </h2>
                            <div className='card-header-info'>
                                Full Name
                                <span className='card-header-info__data'>{`${
                                    contact!.firstName || ""
                                } ${contact?.lastName || ""}`}</span>
                                Company name
                                <span className='card-header-info__data'>
                                    {contact?.companyName}
                                </span>
                            </div>
                        </div>
                        <div className='card-content contact__card'>
                            <div className='grid flex-nowrap'>
                                <div className='p-0 card-content__wrapper'>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        multiple
                                        className='contact__accordion'
                                    >
                                        {contactSections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={section.label}
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
                                </div>
                                <div className='w-full flex flex-column p-0'>
                                    <div className='flex flex-grow-1'>
                                        <Formik
                                            innerRef={formikRef}
                                            validationSchema={ContactFormSchema}
                                            initialValues={
                                                {
                                                    firstName: contact?.firstName || "",
                                                    lastName: contact?.lastName || "",
                                                    type: contact?.type || 0,
                                                    companyName: contact?.companyName || "",
                                                    email1: contact?.email1 || "",
                                                    email2: contact?.email2 || "",
                                                    phone1: contact?.phone1 || "",
                                                    phone2: contact?.phone2 || "",
                                                    Buyer_Emp_Ext:
                                                        contactExtData.Buyer_Emp_Ext || "",
                                                    Buyer_Emp_Phone:
                                                        contactExtData.Buyer_Emp_Phone || "",
                                                } as PartialContact
                                            }
                                            enableReinitialize
                                            validateOnChange={false}
                                            validateOnBlur={false}
                                            validateOnMount={validateOnMount}
                                            onSubmit={() => {
                                                setValidateOnMount(false);
                                                saveContact();
                                                if (memoRoute) {
                                                    navigate(memoRoute);
                                                    store.memoRoute = "";
                                                } else {
                                                    navigate(`/dashboard/contacts`);
                                                }
                                                toast.current?.show({
                                                    severity: "success",
                                                    summary: "Success",
                                                    detail: "Contact saved successfully",
                                                });
                                            }}
                                        >
                                            <Form name='contactForm' className='w-full'>
                                                {contactSections.map((section) =>
                                                    section.items.map((item: ContactItem) => (
                                                        <div
                                                            key={item.itemIndex}
                                                            className={`${
                                                                stepActiveIndex === item.itemIndex
                                                                    ? "block contact-form"
                                                                    : "hidden"
                                                            }`}
                                                        >
                                                            <div className='contact-form__title uppercase'>
                                                                {item.itemLabel}
                                                            </div>
                                                            {stepActiveIndex === item.itemIndex && (
                                                                <Suspense fallback={<Loader />}>
                                                                    {item.component}
                                                                </Suspense>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </Form>
                                        </Formik>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-content-end gap-3 mt-5 mr-3 form-nav'>
                                <Button
                                    onClick={() => {
                                        if (!stepActiveIndex) {
                                            return navigate(`/dashboard/contacts`);
                                        }
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev - 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        });
                                    }}
                                    className='form-nav__button'
                                    outlined
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() =>
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev + 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        })
                                    }
                                    disabled={stepActiveIndex >= itemsMenuCount}
                                    severity={
                                        stepActiveIndex >= itemsMenuCount ? "secondary" : "success"
                                    }
                                    className='form-nav__button'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button
                                    className='form-nav__button'
                                    onClick={handleSaveContactForm}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
});

