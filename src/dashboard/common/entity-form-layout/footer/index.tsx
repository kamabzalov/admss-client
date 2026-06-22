import { ReactElement } from "react";
import { FormNav, FormNavButton } from "dashboard/common/form-nav";

interface EntityFormFooterProps {
    stepActiveIndex: number;
    itemsMenuCount: number;
    deleteActiveIndex?: number;
    activeTab?: number | null;
    isOnDeleteStep?: boolean;
    canDeleteOnStep?: boolean;
    deleteDisabled?: boolean;
    isSaveDisabled: boolean;
    isEditMode: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    onDelete?: () => void;
}

export const EntityFormFooter = ({
    stepActiveIndex,
    itemsMenuCount,
    deleteActiveIndex,
    activeTab = null,
    isOnDeleteStep = false,
    canDeleteOnStep = true,
    deleteDisabled = false,
    isSaveDisabled,
    isEditMode,
    onBack,
    onNext,
    onSave,
    onDelete,
}: EntityFormFooterProps): ReactElement => {
    const isBackDisabled = stepActiveIndex <= 0 && !activeTab;
    const isNextDisabled = stepActiveIndex >= itemsMenuCount;
    const showDelete = isOnDeleteStep && canDeleteOnStep && onDelete;

    return (
        <FormNav>
            <FormNavButton
                onClick={onBack}
                outlined
                disabled={isBackDisabled}
                severity={isBackDisabled ? "secondary" : "success"}
            >
                Back
            </FormNavButton>
            <FormNavButton
                onClick={onNext}
                disabled={isNextDisabled}
                severity={isNextDisabled ? "secondary" : "success"}
                outlined
            >
                Next
            </FormNavButton>
            {showDelete ? (
                <FormNavButton
                    onClick={onDelete}
                    disabled={deleteDisabled}
                    {...(deleteDisabled && { severity: "secondary" })}
                    className='form-nav__button--danger'
                >
                    Delete
                </FormNavButton>
            ) : (
                <FormNavButton
                    type='button'
                    onClick={onSave}
                    disabled={isSaveDisabled}
                    severity={isSaveDisabled ? "secondary" : "success"}
                >
                    {isEditMode ? "Update" : "Save"}
                </FormNavButton>
            )}
        </FormNav>
    );
};
