import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AccordionItems,
    Inventory,
    InventoryItem,
    InventorySection,
    createInventorySections,
    getInventoryMenuCount,
    resetFormStepSectionCounters,
} from "dashboard/inventory/common";
import { FormStepAccordion, SectionHeaderWithCount } from "dashboard/common/form-stepper";
import { InventoryPurchaseData } from "dashboard/inventory/form/purchase";
import { InventoryMediaData } from "dashboard/inventory/form/media-data";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "store/hooks";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { useFormExitConfirmation, useToastMessage, usePermissions } from "common/hooks";
import { checkStockNoAvailability, getVINCheck } from "http/services/inventory-service";
import { InventoryExportWebData } from "dashboard/inventory/form/export-web";

import { useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PrintForms } from "dashboard/inventory/form/print-forms";
import { Loader } from "dashboard/common/loader";
import { Form, Formik, FormikProps } from "formik";
import * as Yup from "yup";

import {
    InventoryExtData,
    Inventory as InventoryModel,
    InventoryWebInfo,
    InventoryStockNumber,
} from "common/models/inventory";
import { MAX_VIN_LENGTH, MIN_VIN_LENGTH } from "dashboard/common/form/vin-decoder";
import { DeleteForm } from "dashboard/inventory/form/delete-form";
import { BaseResponseError, Status } from "common/models/base-response";
import { debounce } from "common/helpers";
import { PHONE_NUMBER_REGEX } from "common/constants/regex";
import { INVENTORY_PAGE } from "common/constants/links";
import {
    EntityFormBody,
    EntityFormCard,
    EntityFormContent,
    EntityFormDeleteNavButton,
    EntityFormFooter,
    EntityFormHeader,
    EntityFormPage,
    EntityFormPrintNavButton,
    EntityFormSteps,
} from "dashboard/common/entity-form-layout";
import { InventoryVehicleData } from "dashboard/inventory/form/vehicle";

const STEP = "step";
export enum INVENTORY_STEPS {
    GENERAL = 1,
    DESCRIPTION = 2,
    OPTIONS = 3,
    CHECKLIST = 4,
    KEYS = 5,
    DISCLOSURES = 6,
    OTHER = 7,
    PURCHASES = 8,
    PAYMENTS = 9,
    EXPENSES = 10,
    TITLE = 11,
    FLOORPLAN = 12,
    CONSIGN = 13,
    IMAGES = 14,
    VIDEO = 15,
    AUDIO = 16,
    DOCUMENTS = 17,
    LINKS = 18,
    WATERMARKING = 19,
    PRICE = 20,
    DATES = 21,
    EXPORT_LINKS = 22,
    FUEL_ECONOMY = 23,
    EXTRA_DATA = 24,
    HISTORY = 25,
}

type PartialInventory = Pick<
    InventoryModel,
    | "VIN"
    | "Make"
    | "Model"
    | "Year"
    | "locationuid"
    | "GroupClassName"
    | "StockNo"
    | "TypeOfFuel_id"
>;

type PartialInventoryExtData = Pick<
    InventoryExtData,
    "purPurchaseEmail" | "purPurchasePhone" | "titleHolderPhone" | "titlePrevPhone"
>;

const tabFields: Partial<
    Record<AccordionItems, (keyof PartialInventory)[] | (keyof PartialInventoryExtData)[]>
> = {
    [AccordionItems.GENERAL]: [
        "VIN",
        "Make",
        "Model",
        "Year",
        "locationuid",
        "GroupClassName",
        "StockNo",
    ],
    [AccordionItems.DESCRIPTION]: ["TypeOfFuel_id"],
    [AccordionItems.PURCHASES]: ["purPurchaseEmail", "purPurchasePhone"],
    [AccordionItems.TITLE]: ["titleHolderPhone", "titlePrevPhone"],
};

const WEB_PRICE_FIELDS: (keyof InventoryWebInfo)[] = ["ListPrice", "SpecialPrice"];
const WEB_DATES_FIELDS: (keyof InventoryWebInfo)[] = ["InStockDate", "LastModifiedDate"];
const WEB_FUEL_FIELDS: (keyof InventoryWebInfo)[] = ["CityMPG", "HwyMPG"];
const WEB_EXTRA_FIELDS: (keyof InventoryWebInfo)[] = [
    "ExtraField1",
    "ExtraField2",
    "ExtraField3",
    "ExtraPrice1",
    "ExtraPrice2",
    "ExtraPrice3",
];
const WEB_HISTORY_FIELDS: (keyof InventoryWebInfo)[] = ["LastExportDate"];

const isEmptyValue = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return true;
    }

    if (typeof value === "string") {
        const trimmedValue = value.trim();
        return !trimmedValue || trimmedValue === "0";
    }

    if (typeof value === "number") {
        return value <= 0;
    }

    return false;
};

const hasAnyFilledField = (
    source: Record<string, unknown> | undefined,
    fields: string[]
): boolean => {
    if (!source) {
        return false;
    }

    return fields.some((field) => !isEmptyValue(source[field]));
};

const hasAllFilledFields = (
    source: Record<string, unknown> | undefined,
    fields: string[]
): boolean => {
    if (!source) {
        return false;
    }

    return fields.every((field) => !isEmptyValue(source[field]));
};

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear();

const enum DIALOG_MESSAGES {
    QUIT = "Are you sure you want to leave this page? All unsaved data will be lost.",
    DELETE = "Do you really want to delete this inventory? This process cannot be undone.",
}

const CREATE_INVENTORY_ID = "create";

export const InventoryForm = observer(() => {
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get(STEP) ? Number(searchParams.get(STEP)) - 1 : 0;
    const { showError, showSuccess } = useToastMessage();
    const { inventoryPermissions } = usePermissions();

    const [isInventoryWebExported, setIsInventoryWebExported] = useState(false);
    const [stepActiveIndex, setStepActiveIndex] = useState<number>(tabParam);
    const [accordionActiveIndex, setAccordionActiveIndex] = useState<number | number[]>([]);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState<boolean>(false);
    const [isDeleteConfirm, setIsDeleteConfirm] = useState<boolean>(false);

    const stepsRef = useRef<HTMLDivElement>(null);
    const store = useStore().inventoryStore;
    const {
        getInventory,
        clearInventory,
        saveInventory,
        getInventoryExportWeb,
        getWebCheckStatus,
        getInventoryExportWebHistory,
        activeTab,
        tabLength,
        inventory,
        inventoryExtData,
        inventoryOptions,
        inventoryAudit,
        inventoryExportWeb,
        images,
        videos,
        audios,
        documents,
        links,
        isFormChanged,
        isErasingNeeded,
        currentLocation,
        deleteReason,
        memoRoute,
    } = store;
    const navigate = useNavigate();
    const [inventorySections, setInventorySections] = useState<InventorySection[]>([]);
    const [itemsMenuCount, setItemsMenuCount] = useState(0);
    const [printActiveIndex, setPrintActiveIndex] = useState<number>(0);
    const [deleteActiveIndex, setDeleteActiveIndex] = useState<number>(0);
    const formikRef = useRef<FormikProps<PartialInventory>>(null);
    const [validateOnMount, setValidateOnMount] = useState<boolean>(false);
    const [errorSections, setErrorSections] = useState<string[]>([]);
    const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const { handleExitClick, ConfirmModalComponent } = useFormExitConfirmation({
        isFormChanged,
        onConfirmExit: () => {
            if (memoRoute) {
                navigate(memoRoute);
                store.memoRoute = "";
            } else {
                navigate(INVENTORY_PAGE.MAIN);
            }
        },
        className: "inventory-confirm-dialog",
    });

    const initialVIN = useMemo(() => {
        if (inventory) {
            return inventory?.VIN;
        }
        return "";
    }, [inventory]);

    const initialStockNo = useMemo(() => {
        if (inventory) {
            return inventory?.StockNo;
        }
        return "";
    }, [inventory]);

    const debouncedCheckStockNoAvailability = useMemo(
        () =>
            debounce(async (value: string, resolve: (exists: boolean) => void) => {
                if (!value || initialStockNo === value) {
                    resolve(true);
                    return;
                }
                try {
                    const res = (await checkStockNoAvailability(
                        value
                    )) as unknown as InventoryStockNumber;
                    resolve(!(res && res.status === Status.OK && res.exists));
                } catch (error) {
                    resolve(true);
                }
            }),
        [initialStockNo]
    );

    const debouncedCheckVINAvailability = useMemo(
        () =>
            debounce(async (value: string, resolve: (exists: boolean) => void) => {
                if (!value || initialVIN === value) {
                    resolve(true);
                    return;
                }
                try {
                    const res = (await getVINCheck(value)) as unknown as InventoryStockNumber;
                    resolve(!(res && res.status === Status.OK && res.exists));
                } catch (error) {
                    resolve(true);
                }
            }, 500),
        [initialVIN]
    );

    const InventoryFormSchema = ({
        debouncedCheckStockNoAvailability,
        debouncedCheckVINAvailability,
        isSubmitting,
    }: {
        initialVIN?: string;
        initialStockNo?: string;
        debouncedCheckStockNoAvailability: (
            value: string,
            resolve: (exists: boolean) => void
        ) => void;
        debouncedCheckVINAvailability: (value: string, resolve: (exists: boolean) => void) => void;
        isSubmitting: boolean;
    }): Yup.ObjectSchema<Partial<PartialInventory>> => {
        return Yup.object().shape({
            VIN: Yup.string()
                .trim()
                .min(MIN_VIN_LENGTH, `VIN must be at least ${MIN_VIN_LENGTH} characters`)
                .max(MAX_VIN_LENGTH, `VIN must be less than ${MAX_VIN_LENGTH} characters`)
                .test("is-vin-available", "VIN is already in use", function (value) {
                    if (isSubmitting) {
                        return true;
                    }
                    return new Promise((resolve) => {
                        debouncedCheckVINAvailability(value || "", resolve);
                    });
                })
                .required("Data is required."),
            Make: Yup.string().trim().required("Data is required."),
            Model: Yup.string().trim().required("Data is required."),
            Year: Yup.string()
                .test(
                    "is-valid-year",
                    `Must be between ${MIN_YEAR} and ${MAX_YEAR}`,
                    function (value) {
                        const year = Number(value);
                        if (year < MIN_YEAR) {
                            return this.createError({
                                message: `Must be greater than ${MIN_YEAR}`,
                            });
                        }
                        if (year > MAX_YEAR) {
                            return this.createError({ message: `Must be less than ${MAX_YEAR}` });
                        }
                        return true;
                    }
                )
                .required("Data is required."),
            locationuid: Yup.string().trim().required("Data is required."),
            GroupClassName: Yup.string().trim().required("Data is required."),
            StockNo: Yup.string()
                .trim()
                .min(1, "Stock number must be at least 1 character")
                .max(20, "Stock number must be at most 20 characters")
                .test("is-stockno-available", "Stock number is already in use", function (value) {
                    if (isSubmitting) {
                        return true;
                    }
                    return new Promise((resolve) => {
                        debouncedCheckStockNoAvailability(value || "", resolve);
                    });
                }),
            TypeOfFuel_id: Yup.string().trim().required("Data is required."),
            purPurchaseEmail: Yup.string().email("Invalid email address"),
            purPurchasePhone: Yup.string().test(
                "is-valid-phone",
                "Invalid phone number",
                (value) => !value || PHONE_NUMBER_REGEX.test(value || "")
            ),
            titleHolderPhone: Yup.string().test(
                "is-valid-phone",
                "Invalid phone number",
                (value) => !value || PHONE_NUMBER_REGEX.test(value || "")
            ),
            titlePrevPhone: Yup.string().test(
                "is-valid-phone",
                "Invalid phone number",
                (value) => !value || PHONE_NUMBER_REGEX.test(value || "")
            ),
        });
    };

    const getUrl = (activeIndex: number) => {
        const currentPath = id ? id : CREATE_INVENTORY_ID;
        return `${INVENTORY_PAGE.EDIT(currentPath)}?step=${activeIndex + 1}`;
    };

    const handleGetInventory = async () => {
        const response = await getInventory();
        const res = response as BaseResponseError;
        if (res?.status === Status.ERROR) {
            showError(res?.error);
            navigate(INVENTORY_PAGE.MAIN);
        }
    };

    useEffect(() => {
        const inventorySections: Pick<Inventory, "label" | "items">[] = [
            InventoryVehicleData,
            InventoryPurchaseData,
            InventoryExportWebData,
        ];
        id && inventorySections.splice(2, 0, InventoryMediaData);
        const sections = createInventorySections(inventorySections);
        setInventorySections(sections);
        const itemsMenuCount = getInventoryMenuCount(sections);
        setItemsMenuCount(itemsMenuCount);
        setPrintActiveIndex(itemsMenuCount + 1);
        setDeleteActiveIndex(itemsMenuCount + 2);

        if (id && id !== CREATE_INVENTORY_ID && isErasingNeeded) {
            store.inventoryID = id;
            handleGetInventory();
        }

        return () => {
            resetFormStepSectionCounters();
            clearInventory();
        };
    }, [id, store]);

    useEffect(() => {
        const lastSectionStartIndex =
            inventorySections[inventorySections.length - 1]?.startIndex ?? 0;

        if (stepActiveIndex >= lastSectionStartIndex && !isInventoryWebExported) {
            if (id) {
                getInventoryExportWeb(id);
                getWebCheckStatus(id);
                getInventoryExportWebHistory(id);
                setIsInventoryWebExported(true);
            }
        }
    }, [inventorySections, stepActiveIndex, isInventoryWebExported, id]);

    const handleOnBackClick = () => {
        setStepActiveIndex((prev) => {
            const newStep = prev - 1;
            navigate(getUrl(newStep));
            return newStep;
        });
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

    const handleActivePrintForms = () => {
        navigate(getUrl(printActiveIndex));
        setStepActiveIndex(printActiveIndex);
    };

    const handleStepChange = useCallback(
        (globalIndex: number) => {
            setStepActiveIndex(globalIndex);
            navigate(getUrl(globalIndex));
        },
        [id, navigate]
    );

    const handleSaveInventoryForm = () => {
        setIsSubmitting(true);
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

                const firstErrorKey = Object.keys(errors)[0];
                const firstErrorMessage = errors[firstErrorKey as keyof typeof errors];

                showError(firstErrorMessage || "Please fill in all required fields.");
            }
            setIsSubmitting(false);
        });
    };

    const isInventoryTabFilled = (itemLabel: AccordionItems | string): boolean => {
        if (!itemLabel) {
            return false;
        }

        switch (itemLabel) {
            case AccordionItems.GENERAL: {
                const requiredFields = tabFields[
                    AccordionItems.GENERAL
                ] as (keyof PartialInventory)[];
                return hasAllFilledFields(
                    inventory as unknown as Record<string, unknown>,
                    requiredFields
                );
            }
            case AccordionItems.DESCRIPTION: {
                const requiredFields = tabFields[
                    AccordionItems.DESCRIPTION
                ] as (keyof PartialInventory)[];
                return hasAllFilledFields(
                    inventory as unknown as Record<string, unknown>,
                    requiredFields
                );
            }
            case AccordionItems.PURCHASES:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "purPurchasedFrom",
                    "purPurchaseAmount",
                    "purPurchaseDate",
                    "purPurchaseBuyerName",
                    "purPurchaseEmail",
                    "purPurchasePhone",
                    "purPurchaseAddress",
                    "purPurchaseCity",
                    "purPurchaseZipCode",
                ]);
            case AccordionItems.PAYMENTS:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "payAskingPrice",
                    "payCashPrice",
                    "payDownPayment",
                    "payPayment",
                    "payTerm",
                    "payAPR",
                    "payAmtFin",
                    "payRemarks",
                ]);
            case AccordionItems.EXPENSES:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "payExpenses",
                    "payDefaultExpAdded",
                ]);
            case AccordionItems.TITLE:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "titleNumber",
                    "titleState",
                    "titleStatus",
                    "titleReceivedDate",
                    "titleHolderName",
                    "titleHolderPhone",
                    "titlePrevName",
                    "titlePrevPhone",
                ]);
            case AccordionItems.FLOORPLAN:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "fpFloorplanCompany",
                    "fpRemainBal",
                    "fpReduxAmt",
                    "fpReductionDate",
                    "fpIsFloorplanned",
                ]);
            case AccordionItems.CONSIGN:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "csIsConsigned",
                    "csName",
                    "csOwnerAskingPrice",
                    "csReserveAmt",
                    "csDate",
                    "csReturnDate",
                    "csNotes",
                ]);
            case AccordionItems.OPTIONS:
                return inventoryOptions.length > 0;
            case AccordionItems.CHECKS:
                return Object.values(inventoryAudit || {}).some((value) => !isEmptyValue(value));
            case AccordionItems.KEYS:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "keyNumber",
                    "keysHasRemote",
                    "keysMissing",
                    "keysDuplicate",
                ]);
            case AccordionItems.DISCLOSURES:
                return hasAnyFilledField(inventoryExtData as unknown as Record<string, unknown>, [
                    "damSalvage",
                    "damFlood",
                    "damTheft",
                    "damReconstructed",
                    "damODOMInExcess",
                    "damODOMNotActual",
                    "bgWarranty",
                    "bgAsIs",
                ]);
            case AccordionItems.OTHER:
                return hasAnyFilledField(inventory as unknown as Record<string, unknown>, [
                    "Trim",
                    "Engine",
                    "Transmission",
                    "ExteriorColor",
                    "InteriorColor",
                    "mileage",
                    "Notes",
                ]);
            case AccordionItems.IMAGES:
                return images.length > 0;
            case AccordionItems.VIDEO:
                return videos.length > 0;
            case AccordionItems.AUDIO:
                return audios.length > 0;
            case AccordionItems.DOCUMENTS:
                return documents.length > 0;
            case AccordionItems.LINKS:
                return links.length > 0;
            case AccordionItems.WATERMARKING:
                return false;
            case AccordionItems.PRICE:
                return hasAnyFilledField(
                    inventoryExportWeb as unknown as Record<string, unknown>,
                    WEB_PRICE_FIELDS
                );
            case AccordionItems.DATES:
                return hasAnyFilledField(
                    inventoryExportWeb as unknown as Record<string, unknown>,
                    WEB_DATES_FIELDS
                );
            case AccordionItems.FUEL:
                return hasAnyFilledField(
                    inventoryExportWeb as unknown as Record<string, unknown>,
                    WEB_FUEL_FIELDS
                );
            case AccordionItems.EXTRA:
                return hasAnyFilledField(
                    inventoryExportWeb as unknown as Record<string, unknown>,
                    WEB_EXTRA_FIELDS
                );
            case AccordionItems.HISTORY:
                return hasAnyFilledField(
                    inventoryExportWeb as unknown as Record<string, unknown>,
                    WEB_HISTORY_FIELDS
                );
            default:
                return false;
        }
    };

    const resolveStepClassName = (item: InventoryItem, globalIndex: number): string => {
        const isFilled = isInventoryTabFilled(item.itemLabel);

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

    const renderSectionHeader = (section: InventorySection) => {
        const filledTabsCount = section.items.reduce(
            (count, item) => (isInventoryTabFilled(item.itemLabel) ? count + 1 : count),
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

    const navigateAndClear = () => {
        if (memoRoute) {
            navigate(memoRoute);
            store.memoRoute = "";
        } else {
            navigate(INVENTORY_PAGE.MAIN);
        }
        clearInventory();
    };

    const showToastMessage = () => {
        showSuccess("Inventory saved successfully");
    };

    const handleSubmit = async (id: string | undefined) => {
        setValidateOnMount(false);
        const response = await saveInventory(id);

        if (response === Status.OK) {
            setIsSubmitting(false);
            navigateAndClear();
            showToastMessage();
        } else {
            setIsSubmitting(false);
            const { error } = response as BaseResponseError;

            showError(error);
        }
    };

    const inventoryHeaderMetadata = useMemo(() => {
        if (!id) {
            return [];
        }

        return [
            { label: "Stock#", value: inventory?.StockNo || "", truncate: false },
            { label: "Make", value: inventory?.Make || "", truncate: false },
            { label: "Model", value: inventory?.Model || "", truncate: false },
            { label: "Year", value: inventory?.Year || "", truncate: false },
            { label: "VIN", value: inventory?.VIN || "", truncate: false },
        ];
    }, [id, inventory]);

    const accordionFooter = useMemo(() => {
        if (!id) {
            return undefined;
        }

        return (
            <>
                <EntityFormPrintNavButton
                    isActive={stepActiveIndex === printActiveIndex}
                    onClick={handleActivePrintForms}
                >
                    Print forms
                </EntityFormPrintNavButton>
                {inventoryPermissions.canDelete() && (
                    <EntityFormDeleteNavButton
                        onClick={() =>
                            inventoryPermissions.canDelete() &&
                            setStepActiveIndex(deleteActiveIndex)
                        }
                    >
                        Delete inventory
                    </EntityFormDeleteNavButton>
                )}
            </>
        );
    }, [
        id,
        stepActiveIndex,
        printActiveIndex,
        deleteActiveIndex,
        inventoryPermissions,
        handleActivePrintForms,
    ]);

    return (
        <Suspense fallback={<Loader className='inventory-loader' />}>
            <EntityFormPage onClose={handleExitClick}>
                <EntityFormCard entityClassName='inventory'>
                    <EntityFormHeader
                        title={`${id ? "Edit" : "Create new"} inventory`}
                        metadata={inventoryHeaderMetadata}
                    />
                    <EntityFormContent>
                        <EntityFormBody
                            sidebar={
                                <FormStepAccordion
                                    sections={inventorySections}
                                    stepActiveIndex={stepActiveIndex}
                                    accordionActiveIndex={accordionActiveIndex}
                                    onAccordionChange={setAccordionActiveIndex}
                                    onStepChange={handleStepChange}
                                    errorSections={errorSections}
                                    resolveStepClassName={resolveStepClassName}
                                    accordionClassName='entity-form-accordion'
                                    stepClassName='border-circle inventory-step'
                                    renderSectionHeader={renderSectionHeader}
                                    navigationRef={stepsRef}
                                    expandMode='sync-with-step'
                                    wrapperClassName='p-0'
                                    footer={accordionFooter}
                                />
                            }
                        >
                            <Formik
                                innerRef={formikRef}
                                validationSchema={InventoryFormSchema({
                                    initialVIN,
                                    initialStockNo,
                                    debouncedCheckStockNoAvailability,
                                    debouncedCheckVINAvailability,
                                    isSubmitting,
                                })}
                                initialValues={
                                    {
                                        VIN: inventory?.VIN || "",
                                        Make: inventory.Make,
                                        Model: inventory.Model,
                                        Year: inventory.Year,
                                        TypeOfFuel_id: inventory?.TypeOfFuel_id || "0",
                                        StockNo: inventory?.StockNo || "",
                                        locationuid: inventory?.locationuid || currentLocation,
                                        GroupClassName: inventory?.GroupClassName || "",
                                        purPurchaseEmail: inventoryExtData?.purPurchaseEmail || "",
                                        purPurchasePhone: inventoryExtData?.purPurchasePhone || "",
                                        titleHolderPhone: inventoryExtData?.titleHolderPhone || "",
                                        titlePrevPhone: inventoryExtData?.titlePrevPhone || "",
                                    } as PartialInventory
                                }
                                enableReinitialize
                                validateOnChange={false}
                                validateOnBlur={false}
                                validateOnMount={validateOnMount}
                                onSubmit={() => handleSubmit(id)}
                            >
                                <Form name='inventoryForm' className='w-full'>
                                    <EntityFormSteps
                                        sections={inventorySections}
                                        stepActiveIndex={stepActiveIndex}
                                        loaderClassName='inventory-loader'
                                        panelClassName='entity-form-panel inventory-form'
                                        titleClassName='entity-form-panel__title inventory-form__title'
                                    >
                                        {stepActiveIndex === printActiveIndex && (
                                            <div className='entity-form-panel inventory-form'>
                                                <div className='entity-form-panel__title inventory-form__title uppercase'>
                                                    Print forms
                                                </div>
                                                <PrintForms />
                                            </div>
                                        )}
                                        {stepActiveIndex === deleteActiveIndex && (
                                            <DeleteForm
                                                attemptedSubmit={attemptedSubmit}
                                                isDeleteConfirm={isDeleteConfirm}
                                            />
                                        )}
                                    </EntityFormSteps>
                                </Form>
                            </Formik>
                        </EntityFormBody>
                        <EntityFormFooter
                            stepActiveIndex={stepActiveIndex}
                            itemsMenuCount={itemsMenuCount}
                            isOnDeleteStep={stepActiveIndex === deleteActiveIndex}
                            isSaveDisabled={!isFormChanged}
                            isEditMode={!!id}
                            onBack={handleOnBackClick}
                            onNext={handleOnNextClick}
                            onSave={handleSaveInventoryForm}
                            onDelete={() =>
                                deleteReason.length
                                    ? setConfirmDeleteVisible(true)
                                    : setAttemptedSubmit(true)
                            }
                        />
                    </EntityFormContent>
                </EntityFormCard>
            </EntityFormPage>
            <ConfirmModalComponent />
            {confirmDeleteVisible && (
                <ConfirmModal
                    visible={confirmDeleteVisible}
                    bodyMessage={DIALOG_MESSAGES.DELETE}
                    confirmAction={() => setIsDeleteConfirm(true)}
                    onHide={() => setConfirmDeleteVisible(false)}
                />
            )}
        </Suspense>
    );
});
