/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Steps } from "primereact/steps";
import { Suspense, useEffect, useRef, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { InventoryVehicleData } from "./vehicle";
import { Button } from "primereact/button";
import { Inventory, InventoryItem, InventorySection } from "../common";
import { InventoryPurchaseData } from "./purchase";
import { InventoryMediaData } from "./media-data";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { deleteInventory, getInventoryDeleteReasonsList } from "http/services/inventory-service";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { InventoryExportWebData } from "./export-web";
import { AuthUser } from "http/services/auth.service";
import { getKeyValue } from "services/local-storage.service";
import { LS_APP_USER } from "common/constants/localStorage";

import { useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PrintForms } from "./print-forms";
import { Loader } from "dashboard/common/loader";
import { Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";

import { Inventory as InventoryModel } from "common/models/inventory";
import { useToast } from "dashboard/common/toast";

const STEP = "step";

type PartialInventory = Pick<
    InventoryModel,
    "VIN" | "Make" | "Model" | "Year" | "locationuid" | "GroupClass" | "StockNo"
>;

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear();

export const InventoryFormSchema: Yup.ObjectSchema<PartialInventory> = Yup.object().shape({
    VIN: Yup.string().trim().required("Data is required."),
    Make: Yup.string().trim().required("Data is required."),
    Model: Yup.string().trim().required("Data is required."),
    Year: Yup.string()
        .min(MIN_YEAR, `Must be greater than ${MIN_YEAR}`)
        .max(MAX_YEAR, `Must be less than ${MAX_YEAR}`)
        .required("Data is required."),
    locationuid: Yup.string().trim().required("Data is required."),
    GroupClass: Yup.number().required("Data is required."),
    StockNo: Yup.string().trim().required("Data is required."),
});

export const InventoryForm = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;
    const toast = useToast();

    const [isInventoryWebExported, setIsInventoryWebExported] = useState(false);
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([]);
    const [confirmActive, setConfirmActive] = useState<boolean>(false);
    const [reason, setReason] = useState<string>("");
    const [comment, setComment] = useState<string>("");
    const stepsRef = useRef<HTMLDivElement>(null);
    const store = useStore().inventoryStore;
    const {
        getInventory,
        clearInventory,
        saveInventory,
        getInventoryExportWeb,
        getInventoryExportWebHistory,
        inventory,
        isFormValid,
    } = store;
    const navigate = useNavigate();
    const [deleteReasonsList, setDeleteReasonsList] = useState<string[]>([]);
    const [inventorySections, setInventorySections] = useState<InventorySection[]>([]);
    const [accordionSteps, setAccordionSteps] = useState<number[]>([0]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const [printActiveIndex, setPrintActiveIndex] = useState<number>(0);
    const [deleteActiveIndex, setDeleteActiveIndex] = useState<number>(0);
    const formikRef = useRef<FormikProps<InventoryModel>>(null);

    const year = parseInt(inventory.Year, 10);

    useEffect(() => {
        const authUser: AuthUser = getKeyValue(LS_APP_USER);
        if (authUser) {
            getInventoryDeleteReasonsList(authUser.useruid).then((res) => {
                Array.isArray(res) && setDeleteReasonsList(res);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        return `/dashboard/inventory/${currentPath}?step=${activeIndex + 1}`;
    };

    useEffect(() => {
        const inventorySections: Pick<Inventory, "label" | "items">[] = [
            InventoryVehicleData,
            InventoryPurchaseData,
            InventoryExportWebData,
        ];
        id && inventorySections.splice(2, 0, InventoryMediaData);
        const sections = inventorySections.map((sectionData) => new InventorySection(sectionData));
        setInventorySections(sections);
        setAccordionSteps(sections.map((item) => item.startIndex));
        const itemsMenuCount = sections.reduce((acc, current) => acc + current.getLength(), -1);
        setItemsMenuCount(itemsMenuCount);
        setPrintActiveIndex(itemsMenuCount + 1);
        setDeleteActiveIndex(itemsMenuCount + 2);

        id && getInventory(id);

        return () => {
            sections.forEach((section) => section.clearCount());
            clearInventory();
        };
    }, [id, store]);

    useEffect(() => {
        if (
            stepActiveIndex >= accordionSteps[accordionSteps.length - 1] &&
            !isInventoryWebExported
        ) {
            if (id) {
                getInventoryExportWeb(id);
                getInventoryExportWebHistory(id);
                setIsInventoryWebExported(true);
            }
        }
    }, [accordionSteps, stepActiveIndex]);

    const handleActivePrintForms = () => {
        navigate(getUrl(printActiveIndex));
        setStepActiveIndex(printActiveIndex);
    };

    const handleDeleteInventory = () => {
        id &&
            deleteInventory(id, { reason, comment }).then(
                (response) => response && navigate("/dashboard/inventory")
            );
    };

    const handleSaveInventoryForm = () => {
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
                    onClick={() => navigate("/dashboard/inventory")}
                />
                <div className='col-12'>
                    <div className='card inventory'>
                        <div className='card-header flex'>
                            <h2 className='card-header__title uppercase m-0'>
                                {id ? "Edit" : "Create new"} inventory
                            </h2>
                            <div className='card-header-info'>
                                Stock#
                                <span className='card-header-info__data'>{inventory?.StockNo}</span>
                                Make
                                <span className='card-header-info__data'>{inventory?.Make}</span>
                                Model
                                <span className='card-header-info__data'>{inventory?.Model}</span>
                                Year
                                <span className='card-header-info__data'>{inventory?.Year}</span>
                                VIN <span className='card-header-info__data'>{inventory?.VIN}</span>
                            </div>
                        </div>
                        <div className='card-content inventory__card'>
                            <div className='grid flex-nowrap inventory__card-content'>
                                <div className='p-0 card-content__wrapper' ref={stepsRef}>
                                    <Accordion
                                        activeIndex={accordionActiveIndex}
                                        onTabChange={(e) => setAccordionActiveIndex(e.index)}
                                        className='inventory__accordion'
                                        multiple
                                    >
                                        <Formik
                                            innerRef={formikRef}
                                            validationSchema={InventoryFormSchema}
                                            initialValues={
                                                {
                                                    VIN: inventory?.VIN || "",
                                                    Make: inventory.Make,
                                                    Model: inventory.Model,
                                                    Year: String(year),
                                                    StockNo: inventory?.StockNo || "",
                                                    locationuid: inventory?.locationuid || "",
                                                    GroupClass: inventory?.GroupClass || 0,
                                                } as InventoryModel
                                            }
                                            enableReinitialize
                                            validateOnChange={false}
                                            validateOnBlur={false}
                                            onSubmit={() => {
                                                saveInventory();
                                                navigate(`/dashboard/inventory`);
                                                toast.current?.show({
                                                    severity: "success",
                                                    summary: "Success",
                                                    detail: "Deal saved successfully",
                                                });
                                            }}
                                        >
                                            <Form name='inventoryForm'>
                                                {inventorySections.map((section) => (
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
                                                                ({ itemLabel, template }, idx) => ({
                                                                    label: itemLabel,
                                                                    template,
                                                                    command: () => {
                                                                        navigate(
                                                                            getUrl(
                                                                                section.startIndex +
                                                                                    idx
                                                                            )
                                                                        );
                                                                    },
                                                                })
                                                            )}
                                                            className='vertical-step-menu'
                                                            pt={{
                                                                menu: {
                                                                    className: "flex-column w-full",
                                                                },
                                                                step: {
                                                                    className:
                                                                        "border-circle inventory-step",
                                                                },
                                                            }}
                                                        />
                                                    </AccordionTab>
                                                ))}
                                            </Form>
                                        </Formik>
                                    </Accordion>
                                    {id && (
                                        <Button
                                            icon='icon adms-print'
                                            className={`p-button gap-2 inventory__print-nav ${
                                                stepActiveIndex === printActiveIndex &&
                                                "inventory__print-nav--active"
                                            } w-full`}
                                            onClick={handleActivePrintForms}
                                        >
                                            Print forms
                                        </Button>
                                    )}
                                    {id && (
                                        <Button
                                            icon='pi pi-times'
                                            className='p-button gap-2 inventory__delete-nav w-full'
                                            severity='danger'
                                            onClick={() => setStepActiveIndex(deleteActiveIndex)}
                                        >
                                            Delete inventory
                                        </Button>
                                    )}
                                </div>
                                <div className='w-full flex flex-column p-0 card-content__wrapper'>
                                    <div className='flex flex-grow-1'>
                                        {inventorySections.map((section) =>
                                            section.items.map((item: InventoryItem) => (
                                                <div
                                                    key={item.itemIndex}
                                                    className={`${
                                                        stepActiveIndex === item.itemIndex
                                                            ? "block inventory-form"
                                                            : "hidden"
                                                    }`}
                                                >
                                                    <div className='inventory-form__title uppercase'>
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
                                            <div className='inventory-form'>
                                                <div className='inventory-form__title uppercase'>
                                                    Print history
                                                </div>
                                                <PrintForms />
                                            </div>
                                        )}
                                        {stepActiveIndex === deleteActiveIndex && (
                                            <div className='inventory-form'>
                                                <div className='inventory-form__title inventory-form__title--danger uppercase'>
                                                    Delete inventory
                                                </div>
                                                <div className='grid'>
                                                    <div className='col-6'>
                                                        <Dropdown
                                                            optionLabel='name'
                                                            optionValue='name'
                                                            value={reason}
                                                            required
                                                            filter
                                                            onChange={({ value }) => {
                                                                setReason(value);
                                                            }}
                                                            options={deleteReasonsList}
                                                            placeholder='Reason'
                                                            className='w-full vehicle-general__dropdown'
                                                        />
                                                    </div>
                                                    <div className='col-12'>
                                                        <span className='p-float-label'>
                                                            <InputTextarea
                                                                className='w-full'
                                                                value={comment}
                                                                pt={{
                                                                    root: {
                                                                        style: {
                                                                            height: "110px",
                                                                        },
                                                                    },
                                                                }}
                                                                onChange={({
                                                                    target: { value },
                                                                }) => {
                                                                    setComment(value);
                                                                }}
                                                            />
                                                            <label className='float-label'>
                                                                Comment
                                                            </label>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-content-end gap-3 mt-8 mr-3'>
                                <Button
                                    onClick={() => {
                                        if (!stepActiveIndex) {
                                            return navigate(`/dashboard/inventory`);
                                        }
                                        setStepActiveIndex((prev) => {
                                            const newStep = prev - 1;
                                            navigate(getUrl(newStep));
                                            return newStep;
                                        });
                                    }}
                                    className='uppercase px-6 inventory__button'
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
                                        stepActiveIndex === deleteActiveIndex ||
                                        stepActiveIndex >= itemsMenuCount
                                            ? "secondary"
                                            : "success"
                                    }
                                    className='uppercase px-6 inventory__button'
                                    outlined
                                >
                                    Next
                                </Button>
                                {stepActiveIndex === deleteActiveIndex ? (
                                    <Button
                                        onClick={() => setConfirmActive(true)}
                                        className='p-button uppercase px-6 inventory__button inventory__button--danger'
                                    >
                                        Delete
                                    </Button>
                                ) : (
                                    <Button
                                        className='uppercase px-6 inventory__button'
                                        disabled={!isFormValid}
                                        onClick={handleSaveInventoryForm}
                                    >
                                        Save
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                visible={confirmActive}
                bodyMessage='Do you really want to delete this inventory? 
                This process cannot be undone.'
                confirmAction={handleDeleteInventory}
                onHide={() => setConfirmActive(false)}
            />
        </Suspense>
    );
});
