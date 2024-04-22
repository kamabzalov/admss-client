/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ContactItem, ContactSection } from "../common/step-navigation";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "primereact/progressbar";
import { GeneralInfoData } from "./general-info";
import { ContactInfoData } from "./contact-info";
import { ContactMediaData } from "./media-data";
import { useStore } from "store/hooks";
import { useLocation } from "react-router-dom";
const STEP = "step";

export const ContactForm = () => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    const [contactSections, setContactSections] = useState<ContactSection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const store = useStore().contactStore;
    const { getContact, clearContact, saveContact } = store;
    const navigate = useNavigate();
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
                            <h2 className='card-header__title uppercase m-0'>
                                {id ? "Edit" : "Create new"} contact
                            </h2>
                        </div>
                        <div className='card-content contact__card'>
                            <div className='grid flex-nowrap'>
                                <div className='p-0'>
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
                                        {contactSections.map((section) =>
                                            section.items.map((item: ContactItem) => (
                                                <div
                                                    key={item.itemIndex}
                                                    className={`${
                                                        stepActiveIndex === item.itemIndex
                                                            ? "block inventory-form"
                                                            : "hidden"
                                                    }`}
                                                >
                                                    <div className='contact-form__title uppercase'>
                                                        {item.itemLabel}
                                                    </div>
                                                    {stepActiveIndex === item.itemIndex && (
                                                        <Suspense
                                                            fallback={
                                                                <ProgressBar
                                                                    mode='indeterminate'
                                                                    style={{ height: "8px" }}
                                                                    color='var(--admss-app-main-blue)'
                                                                />
                                                            }
                                                        >
                                                            {item.component}
                                                        </Suspense>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-content-end gap-3 mt-5 mr-3'>
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
                                    className='uppercase px-6'
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
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button onClick={saveContact} className='uppercase px-6'>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Suspense>
    );
};
