import { ReactElement } from "react";

interface LeadFormSidebarProps {
    activeStep: number;
    onStepChange: (step: number) => void;
    showVehicleStep: boolean;
}

export const LeadFormSidebar = ({
    activeStep,
    onStepChange,
    showVehicleStep,
}: LeadFormSidebarProps): ReactElement => {
    return (
        <aside className='lead__tabs'>
            <button
                type='button'
                className={`lead__tab ${activeStep === 0 ? "lead__tab--active" : ""}`}
                onClick={() => onStepChange(0)}
            >
                Contact Information
            </button>
            {showVehicleStep && (
                <button
                    type='button'
                    className={`lead__tab ${activeStep === 1 ? "lead__tab--active" : ""}`}
                    onClick={() => onStepChange(1)}
                >
                    Vehicle Information
                </button>
            )}
        </aside>
    );
};
