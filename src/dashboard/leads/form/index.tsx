import { ReactElement, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Tooltip } from "primereact/tooltip";
import { Form, Formik, FormikHelpers } from "formik";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LEADS_PAGE } from "common/constants/links";
import { FormNav, FormNavButton } from "dashboard/common/form-nav";
import { ExistingLeadState, LeadFormValues } from "dashboard/leads/form/types";
import { getInitialValues, saveLeadDraft, validationSchema } from "dashboard/leads/form/helpers";
import { LeadFormSidebar } from "dashboard/leads/form/common/sidebar";
import { ContactInformationStep } from "dashboard/leads/form/contact-information";
import { VehicleInformationStep } from "dashboard/leads/form/vehicle-information";
import "./index.css";

const CONTACT_STEP = 0;
const VEHICLE_STEP = 1;
const LAST_STEP = VEHICLE_STEP;

export const LeadsForm = (): ReactElement => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState<number>(CONTACT_STEP);
    const locationState = location.state as ExistingLeadState | null;
    const prevPath = locationState?.prevPath;
    const initialValues = useMemo(
        () => getInitialValues(id, locationState?.lead),
        [id, locationState?.lead]
    );

    const handleSubmit = (
        values: LeadFormValues,
        { setSubmitting }: FormikHelpers<LeadFormValues>
    ) => {
        saveLeadDraft(values);
        setSubmitting(false);
        navigate(LEADS_PAGE.MAIN);
    };

    const handleExit = () => {
        if (prevPath) {
            navigate(prevPath);
            return;
        }

        navigate(LEADS_PAGE.MAIN);
    };

    return (
        <div className='grid relative lead'>
            <Tooltip target='.lead-form__convert-wrap[data-pr-tooltip]' showOnDisabled />
            <Button icon='pi pi-times' className='lead__close-button' onClick={handleExit} />
            <div className='col-12'>
                <Formik<LeadFormValues>
                    initialValues={initialValues}
                    enableReinitialize
                    validateOnChange={false}
                    validateOnBlur={false}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                        values,
                        errors,
                        setFieldValue,
                        setFieldError,
                        setErrors,
                        setTouched,
                        submitForm,
                        isSubmitting,
                        dirty,
                    }) => {
                        const handleFieldValueChange = (field: string, value: unknown) => {
                            setFieldValue(field, value);
                            if (field === "type") {
                                setErrors({});
                                setTouched({});
                                return;
                            }

                            setFieldError(field, undefined);
                        };
                        const clearFieldError = (field: keyof LeadFormValues) =>
                            setFieldError(field, undefined);

                        return (
                            <Form className='card lead__card'>
                                <div className='card-header lead__header'>
                                    <h2 className='lead__title'>
                                        {id ? "Edit" : "Create new"} lead
                                    </h2>
                                </div>
                                <div className='lead__body'>
                                    <LeadFormSidebar
                                        activeStep={activeStep}
                                        onStepChange={setActiveStep}
                                        showVehicleStep={Boolean(values.type)}
                                    />
                                    <section className='lead__panel card-content__wrapper'>
                                        {activeStep === CONTACT_STEP ? (
                                            <ContactInformationStep
                                                values={values}
                                                errors={errors}
                                                setFieldValue={handleFieldValueChange}
                                                clearFieldError={clearFieldError}
                                            />
                                        ) : (
                                            <VehicleInformationStep
                                                values={values}
                                                errors={errors}
                                                setFieldValue={handleFieldValueChange}
                                                clearFieldError={clearFieldError}
                                            />
                                        )}
                                    </section>
                                </div>

                                <FormNav className='lead__footer'>
                                    <FormNavButton
                                        onClick={() => {
                                            if (activeStep === CONTACT_STEP) {
                                                handleExit();
                                                return;
                                            }
                                            setActiveStep((prev) => prev - 1);
                                        }}
                                        outlined
                                    >
                                        Back
                                    </FormNavButton>
                                    <FormNavButton
                                        onClick={() => setActiveStep((prev) => prev + 1)}
                                        disabled={activeStep >= LAST_STEP || !values.type}
                                        severity={activeStep >= LAST_STEP ? "secondary" : "success"}
                                        outlined
                                    >
                                        Next
                                    </FormNavButton>
                                    <FormNavButton
                                        onClick={() => submitForm()}
                                        severity={!dirty || isSubmitting ? "secondary" : "success"}
                                        disabled={!dirty || isSubmitting}
                                    >
                                        Save
                                    </FormNavButton>
                                </FormNav>
                            </Form>
                        );
                    }}
                </Formik>
            </div>
        </div>
    );
};
