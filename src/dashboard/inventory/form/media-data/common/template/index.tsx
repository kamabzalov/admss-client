import { ChangeEvent, ReactElement, ReactNode } from "react";
import { FileUploadHeaderTemplateOptions } from "primereact/fileupload";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { TextInput } from "dashboard/common/form/inputs";
import { CATEGORIES } from "common/constants/media-categories";
import { ComboBox } from "dashboard/common/form/dropdown";
import { MediaLimitations } from "common/models/inventory";

export interface CreateMediaChooseTemplateParams {
    totalCount: number;
    limitations: MediaLimitations;
    dragDropMoreText: string;
    tooltipContent: ReactNode;
}

export function createMediaChooseTemplate({
    totalCount,
    limitations,
    dragDropMoreText,
    tooltipContent,
}: CreateMediaChooseTemplateParams): ({
    chooseButton,
}: FileUploadHeaderTemplateOptions) => ReactElement {
    return ({ chooseButton }: FileUploadHeaderTemplateOptions) => (
        <div className='w-full flex justify-content-center flex-wrap mb-3 media-choose'>
            {totalCount ? (
                <div className='media-choose__selected flex align-items-center'>
                    {dragDropMoreText}
                    <span className='font-semibold mx-3'>or</span>
                    {chooseButton}
                </div>
            ) : (
                <>
                    {chooseButton}
                    <div className='flex w-full justify-content-center align-items-center mt-4 relative'>
                        <span className='media__upload-text-info media__upload-text-info--bold'>
                            Up to {limitations.maxUpload} items
                        </span>
                        <span className='media__upload-text-info'>
                            Maximal size is {limitations.maxSize} Mb
                        </span>
                        {limitations.formats.map((format) => (
                            <Tag key={format} className='media__upload-tag' value={format} />
                        ))}
                        <div className='media-tooltip'>
                            <InfoOverlayPanel panelTitle='Limitations:'>
                                {tooltipContent}
                            </InfoOverlayPanel>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export interface MediaUploadFieldsProps {
    categoryValue: number;
    onCategoryChange: (e: DropdownChangeEvent) => void;
    notesValue: string;
    onNotesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    canSave: boolean;
    isLoading: boolean;
    comboClassName?: string;
}

export function MediaUploadFields({
    categoryValue,
    onCategoryChange,
    notesValue,
    onNotesChange,
    onSave,
    canSave,
    isLoading,
    comboClassName = "media-input__dropdown",
}: MediaUploadFieldsProps): ReactElement {
    return (
        <div className='col-12 mt-4 media-input'>
            <ComboBox
                className={comboClassName}
                placeholder='Category'
                optionLabel={"name"}
                optionValue={"id"}
                options={[...CATEGORIES]}
                value={categoryValue}
                onChange={onCategoryChange}
            />
            <TextInput
                name='comment'
                label='Comment'
                className='media-input__text'
                placeholder='Comment'
                value={notesValue}
                onChange={onNotesChange}
            />
            <Button
                severity={canSave ? "success" : "secondary"}
                disabled={!canSave || isLoading}
                className='p-button media-input__button'
                onClick={onSave}
            >
                Save
            </Button>
        </div>
    );
}

export interface MediaUploadedSectionHeaderProps {
    title: string;
    currentCount: number;
    maxCount: number;
    highlightCount?: boolean;
    trailing?: ReactNode;
}

export function MediaUploadedSectionHeader({
    title,
    currentCount,
    maxCount,
    highlightCount,
    trailing,
}: MediaUploadedSectionHeaderProps): ReactElement {
    return (
        <div className='col-12 media__uploaded media-uploaded'>
            <h2 className='media-uploaded__title uppercase m-0'>{title}</h2>
            <span
                className={`media-uploaded__label mx-2 uploaded-count ${
                    highlightCount && "uploaded-count--blue"
                }`}
            >
                ({currentCount}/{maxCount})
            </span>
            <hr className='media-uploaded__line flex-1' />
            {trailing}
        </div>
    );
}
