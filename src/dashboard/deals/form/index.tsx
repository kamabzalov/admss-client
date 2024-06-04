/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Deals, DealsItem, DealsSection } from "../common";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { DealGeneralInfo } from "./general-info";
import { DealRetail } from "./retail";
import { useStore } from "store/hooks";
import { Loader } from "dashboard/common/loader";
import { PrintDealForms } from "./print-forms";
import { Form, Formik, FormikProps } from "formik";
import { Deal, DealExtData } from "common/models/deals";
import * as Yup from "yup";
import { useToast } from "dashboard/common/toast";

const STEP = "step";

export const DealFormSchema = Yup.object().shape({
    contactuid: Yup.string().required("Data is required."),
    inventoryuid: Yup.string().required("Data is required."),
    dealtype: Yup.string().required("Data is required."),
    dealstatus: Yup.string().required("Data is required."),
    saletype: Yup.string().required("Data is required."),
    datepurchase: Yup.string().required("Data is required."),
    dateeffective: Yup.string().required("Data is required."),
    inventorystatus: Yup.string().required("Data is required."),
    HowFoundOut: Yup.string().required("Data is required."),
    SaleID: Yup.string().required("Data is required."),
    OdometerReading: Yup.string().required("Data is required."),
    OdomDigits: Yup.string().required("Data is required."),
});

export const DealsForm = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const toast = useToast();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;

    const store = useStore().dealStore;
    const { deal, dealExtData, getDeal, saveDeal, clearDeal, isFormChanged } = store;

    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([0]);
    const stepsRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [dealsSections, setDealsSections] = useState<DealsSection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const [printActiveIndex, setPrintActiveIndex] = useState<number>(0);
    const formikRef = useRef<FormikProps<Partial<Deal> & Partial<DealExtData>>>(null);

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

    const getUrl = (activeIndex: number) => {
        const currentPath = id ? id : "create";
        return `/dashboard/deals/${currentPath}?step=${activeIndex + 1}`;
    };

    useEffect(() => {
        const dealsSections: Pick<Deals, "label" | "items">[] = [DealGeneralInfo, DealRetail];
        const sections = dealsSections.map((sectionData) => new DealsSection(sectionData));
        setDealsSections(sections);
        setAccordionSteps(sections.map((item) => item.startIndex));
        const itemsMenuCount = sections.reduce((acc, current) => acc + current.getLength(), -1);
        setItemsMenuCount(itemsMenuCount);
        setPrintActiveIndex(itemsMenuCount + 1);

        id && getDeal(id);
        return () => {
            sections.forEach((section) => section.clearCount());
            clearDeal();
        };
    }, [id]);

    useEffect(() => {
        accordionSteps.forEach((step, index) => {
            if (step - 1 < stepActiveIndex) {
                if (stepActiveIndex === printActiveIndex) return setAccordionActiveIndex([]);
                return setAccordionActiveIndex((prev) => {
                    const updatedArray = Array.isArray(prev) ? [...prev] : [];
                    updatedArray[index] = index;
                    return updatedArray;
                });
            }
        });
    }, [stepActiveIndex]);

    const handleActivePrintForms = () => {
        navigate(getUrl(printActiveIndex));
        setStepActiveIndex(printActiveIndex);
    };

    const handleSaveDealForm = () => {
        formikRef.current?.validateForm().then((errors) => {
            if (!Object.keys(errors).length) {
                formikRef.current?.submitForm();
            } else {
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
                    onClick={() => navigate("/dashboard/deals")}
                />
                <div className='col-12'>
                    <div className='card deal'>
                        <div className='card-header flex'>
                            <h2 className='card-header__title uppercase m-0'>
                                {id ? "Edit" : "Create new"} Deal
                            </h2>
                        </div>
                        <div className='card-content deal__card'>
                            <div className='grid flex-nowrap deal__card-content'>
                                <div className='p-0 card-content__wrapper' ref={stepsRef}>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        className='deal__accordion'
                                        multiple
                                    >
                                        {dealsSections.map((section) => (
                                            <AccordionTab
                                                key={section.sectionId}
                                                header={section.label}
                                            >
                                                <Steps
                                                    readOnly={false}
                                                    activeIndex={
                                                        stepActiveIndex - section.startIndex
                                                    }
                                                    onSelect={(e) => {
                                                        setStepActiveIndex(
                                                            e.index + section.startIndex
                                                        );
                                                    }}
                                                    model={section.items.map(
                                                        (
                                                            { itemLabel, template }: any,
                                                            idx: number
                                                        ) => ({
                                                            label: itemLabel,
                                                            template,
                                                            command: () => {
                                                                navigate(
                                                                    getUrl(section.startIndex + idx)
                                                                );
                                                            },
                                                        })
                                                    )}
                                                    className='vertical-step-menu'
                                                    pt={{
                                                        menu: { className: "flex-column w-full" },
                                                        step: {
                                                            className: "border-circle deal-step",
                                                        },
                                                    }}
                                                />
                                            </AccordionTab>
                                        ))}
                                    </Accordion>
                                    {id && (
                                        <Button
                                            icon='icon adms-print'
                                            className={`p-button gap-2 deal__print-nav ${
                                                stepActiveIndex === printActiveIndex &&
                                                "deal__print-nav--active"
                                            } w-full`}
                                            onClick={handleActivePrintForms}
                                        >
                                            Print forms
                                        </Button>
                                    )}
                                </div>
                                <div className='w-full flex flex-column p-0 card-content__wrapper'>
                                    <div className='flex flex-grow-1'>
                                        <Formik
                                            innerRef={formikRef}
                                            initialValues={
                                                {
                                                    contactuid: deal.contactuid || "",
                                                    inventoryuid: deal.inventoryuid || "",
                                                    dealtype: deal.dealtype,
                                                    dealstatus: deal.dealstatus,
                                                    saletype: deal.saletype,
                                                    datepurchase: deal.datepurchase,
                                                    dateeffective: deal.dateeffective,
                                                    inventorystatus: deal.inventorystatus,
                                                    accountuid: deal.accountuid || "",
                                                    HowFoundOut: dealExtData?.HowFoundOut || "",
                                                    SaleID: dealExtData?.SaleID || "",
                                                    OdometerReading:
                                                        dealExtData?.OdometerReading || "",
                                                    OdomDigits: dealExtData?.OdomDigits || "",
                                                } as Partial<Deal> & Partial<DealExtData>
                                            }
                                            enableReinitialize
                                            validationSchema={DealFormSchema}
                                            validateOnChange={false}
                                            validateOnBlur={false}
                                            onSubmit={() => {
                                                saveDeal();
                                                navigate(`/dashboard/deals`);
                                                toast.current?.show({
                                                    severity: "success",
                                                    summary: "Success",
                                                    detail: "Deal saved successfully",
                                                });
                                            }}
                                        >
                                            <Form name='dealForm'>
                                                {dealsSections.map((section) =>
                                                    section.items.map((item: DealsItem) => (
                                                        <div
                                                            key={item.itemIndex}
                                                            className={`${
                                                                stepActiveIndex === item.itemIndex
                                                                    ? "block deal-form"
                                                                    : "hidden"
                                                            }`}
                                                        >
                                                            <div className='deal-form__title uppercase'>
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
                                                {stepActiveIndex === printActiveIndex && (
                                                    <div className='deal-form'>
                                                        <div className='deal-form__title uppercase'>
                                                            Print forms
                                                        </div>
                                                        <PrintDealForms />
                                                    </div>
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
                                            return navigate(`/dashboard/deals`);
                                        }
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev - 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        });
                                    }}
                                    className='form-nav__button deal__button'
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
                                    className='form-nav__button deal__button'
                                    outlined
                                >
                                    Next
                                </Button>
                                <Button
                                    onClick={handleSaveDealForm}
                                    className='form-nav__button deal__button'
                                    severity={isFormChanged ? "success" : "secondary"}
                                    disabled={!isFormChanged}
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
