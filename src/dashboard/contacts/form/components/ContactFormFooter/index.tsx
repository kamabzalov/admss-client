import { ReactElement } from "react";
import { FormNav, FormNavButton } from "dashboard/common/form-nav";

interface ContactFormFooterProps {
    stepActiveIndex: number;
    itemsMenuCount: number;
    deleteActiveIndex: number;
    activeTab: number | null;
    canDelete: boolean;
    deleteReason: string;
    isContactChanged: boolean;
    hasContactType: boolean;
    isEditMode: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    onDeleteClick: () => void;
}

export default function ContactFormFooter({
    stepActiveIndex,
    itemsMenuCount,
    deleteActiveIndex,
    activeTab,
    canDelete,
    deleteReason,
    isContactChanged,
    hasContactType,
    isEditMode,
    onBack,
    onNext,
    onSave,
    onDeleteClick,
}: ContactFormFooterProps): ReactElement {
    const isOnDeleteStep = stepActiveIndex === deleteActiveIndex && canDelete;
    const isBackDisabled = stepActiveIndex <= 0 && !activeTab;
    const isNextDisabled = stepActiveIndex >= itemsMenuCount;

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
            {isOnDeleteStep ? (
                <FormNavButton
                    onClick={onDeleteClick}
                    disabled={!deleteReason.length}
                    {...(!deleteReason.length && { severity: "secondary" })}
                    className='form-nav__button--danger'
                >
                    Delete
                </FormNavButton>
            ) : (
                <FormNavButton
                    type='button'
                    onClick={onSave}
                    disabled={!isContactChanged || !hasContactType}
                    severity={isContactChanged && hasContactType ? "success" : "secondary"}
                >
                    {isEditMode ? "Update" : "Save"}
                </FormNavButton>
            )}
        </FormNav>
    );
}
