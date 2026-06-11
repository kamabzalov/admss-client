import { ReactElement } from "react";
import { Button } from "primereact/button";

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
        <div className='flex justify-content-end gap-3 mt-5 mr-3 form-nav'>
            <Button
                onClick={onBack}
                className='form-nav__button'
                outlined
                disabled={isBackDisabled}
                severity={isBackDisabled ? "secondary" : "success"}
            >
                Back
            </Button>
            <Button
                onClick={onNext}
                disabled={isNextDisabled}
                severity={isNextDisabled ? "secondary" : "success"}
                className='form-nav__button'
                outlined
            >
                Next
            </Button>
            {isOnDeleteStep ? (
                <Button
                    onClick={onDeleteClick}
                    disabled={!deleteReason.length}
                    {...(!deleteReason.length && { severity: "secondary" })}
                    className='form-nav__button form-nav__button--danger'
                >
                    Delete
                </Button>
            ) : (
                <Button
                    className='form-nav__button'
                    type='button'
                    onClick={onSave}
                    disabled={!isContactChanged || !hasContactType}
                    severity={isContactChanged && hasContactType ? "success" : "secondary"}
                >
                    {isEditMode ? "Update" : "Save"}
                </Button>
            )}
        </div>
    );
}
