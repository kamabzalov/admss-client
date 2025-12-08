interface ProgressIndicatorProps {
    currentStep: number;
}

export const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
    const steps = [1, 2, 3];
    return (
        <div className='two-factor-auth__progress'>
            {steps.map((step) => (
                <div
                    key={step}
                    className={`two-factor-auth__progress-dot ${
                        step <= currentStep ? "two-factor-auth__progress-dot--active" : ""
                    }`}
                />
            ))}
        </div>
    );
};
