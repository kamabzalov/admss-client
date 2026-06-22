import { ReactElement } from "react";
import { EntityFormFooter } from "dashboard/common/entity-form-layout";

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
    return (
        <EntityFormFooter
            stepActiveIndex={stepActiveIndex}
            itemsMenuCount={itemsMenuCount}
            deleteActiveIndex={deleteActiveIndex}
            activeTab={activeTab}
            isOnDeleteStep={stepActiveIndex === deleteActiveIndex}
            canDeleteOnStep={canDelete}
            deleteDisabled={!deleteReason.length}
            isSaveDisabled={!isContactChanged || !hasContactType}
            isEditMode={isEditMode}
            onBack={onBack}
            onNext={onNext}
            onSave={onSave}
            onDelete={onDeleteClick}
        />
    );
}
