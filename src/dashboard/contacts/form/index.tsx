/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { ContactItem, ContactSection } from "../common";
import { useParams } from "react-router-dom";
import { ProgressBar } from "primereact/progressbar";
import { ContactUser, getContactInfo } from "http/services/contacts-service";
import { GeneralInfoData } from "./general-info";
import { ContactInfoData } from "./contact-info";
import { ContactMediaData } from "./media-data";

export const contactSections = [GeneralInfoData, ContactInfoData, ContactMediaData].map(
    (sectionData) => new ContactSection(sectionData)
);

export const ContactForm = () => {
    const { id } = useParams();
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(0);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const [contact, setContact] = useState<ContactUser>();

    useEffect(() => {
        id && getContactInfo(id).then((response) => response && setContact(response));
    }, [id]);

    const accordionSteps = contactSections.map((item) => item.startIndex);
    const itemsMenuCount = contactSections.reduce((acc, current) => acc + current.getLength(), -1);

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
            <div className='grid'>
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
                                        className='contact__accordion'
                                        multiple
                                    >
                                        {contactSections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={section.label}
                                            >
                                                <Steps
                                                    model={section.items.map(
                                                        ({ itemLabel, template }) => ({
                                                            label: itemLabel,
                                                            template,
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
                                    onClick={() => setStepActiveIndex((prev) => --prev)}
                                    disabled={!stepActiveIndex}
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStepActiveIndex((prev) => ++prev)}
                                    disabled={stepActiveIndex >= itemsMenuCount}
                                    className='uppercase px-6'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button onClick={() => {}} className='uppercase px-6'>
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
