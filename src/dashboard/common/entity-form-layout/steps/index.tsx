import { ReactElement, ReactNode, Suspense } from "react";
import { FormStepItem, FormStepSection } from "dashboard/common/form-stepper";
import { Loader } from "dashboard/common/loader";

interface EntityFormStepsProps {
    sections: FormStepSection[];
    stepActiveIndex: number;
    children?: ReactNode;
    loaderClassName?: string;
    panelClassName?: string;
    titleClassName?: string;
}

export const EntityFormSteps = ({
    sections,
    stepActiveIndex,
    children,
    loaderClassName = "entity-form-panel__loader",
    panelClassName = "entity-form-panel",
    titleClassName = "entity-form-panel__title",
}: EntityFormStepsProps): ReactElement => {
    return (
        <div className='flex flex-grow-1'>
            {sections.map((section) =>
                section.items.map((item: FormStepItem) => (
                    <div
                        key={item.itemIndex}
                        className={
                            stepActiveIndex === item.itemIndex
                                ? `block ${panelClassName}`
                                : "hidden"
                        }
                    >
                        <div className={`${titleClassName} uppercase heading-condensed`.trim()}>
                            {item.itemLabel}
                        </div>
                        {stepActiveIndex === item.itemIndex && (
                            <Suspense fallback={<Loader className={loaderClassName} />}>
                                {item.component}
                            </Suspense>
                        )}
                    </div>
                ))
            )}
            {children}
        </div>
    );
};
