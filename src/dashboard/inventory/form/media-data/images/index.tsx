import "./index.css";
import { ReactElement, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import {
    FileUpload,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
    FileUploadUploadEvent,
    ItemTemplateOptions,
} from "primereact/fileupload";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useStore } from "store/hooks";
import { Image } from "primereact/image";
import { Checkbox } from "primereact/checkbox";
import { LimitationsPanel } from "dashboard/common/tooltip";

const limitations = {
    formats: ["PNG", "JPEG", "TIFF"],
    minResolution: "512x512",
    maxResolution: "8192x8192",
    maxSize: 8,
    maxUpload: 16,
};

export const ImagesMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { saveInventoryImages, uploadFileImages, images, isLoading, removeImage, fetchImages } =
        store;
    const [checked, setChecked] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);

    useEffect(() => {
        fetchImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.uploadFileImages = e.files;
        setTotalCount(e.files.length);
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = uploadFileImages.filter((item) => item.name !== file.name);
        store.uploadFileImages = newFiles;
        setTotalCount(newFiles.length);
        callback();
    };

    const handleUploadFiles = () => {
        saveInventoryImages().then((res) => {
            if (res) {
                fileUploadRef.current?.clear();
            }
        });
    };

    const handleDeleteImage = (mediauid: string) => {
        removeImage(mediauid);
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center presentation'>
                <div className='flex align-items-center'>
                    <img
                        alt={file.name}
                        src={URL.createObjectURL(file)}
                        role='presentation'
                        width={29}
                        height={29}
                        className='presentation__image'
                    />
                    <span className='presentation__label flex flex-column text-left ml-3'>
                        {file.name}
                    </span>
                </div>
                <Button
                    type='button'
                    icon='pi pi-times'
                    className='p-button presentation__remove-button'
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                />
            </div>
        );
    };

    const chooseTemplate = ({ chooseButton }: FileUploadHeaderTemplateOptions) => {
        return (
            <div className='w-full flex justify-content-center flex-wrap mb-3 image-choose'>
                {totalCount ? (
                    <div className='image-choose__selected flex align-items-center'>
                        To upload more drag and drop images
                        <span className='bold mx-3'>or</span>
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
                                <LimitationsPanel>
                                    <p>
                                        <b>Supported formats</b>:{" "}
                                        {limitations.formats.map((format, index) => (
                                            <span key={index}>
                                                {format}
                                                {index !== limitations.formats.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </p>
                                    <p>
                                        <b>Minimal resolution</b>: {limitations.minResolution}
                                    </p>
                                    <p>
                                        <b>Maximal resolution</b>: {limitations.maxResolution}
                                    </p>
                                    <p>
                                        <b>Maximal size</b>: {limitations.maxSize} MBytes
                                    </p>
                                    <p>
                                        <b>Batch upload</b>: Up to {limitations.maxUpload} items
                                    </p>
                                </LimitationsPanel>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className='grid'>
                <div className='flex align-items-center flex-column col-12'>
                    <i className='pi pi-cloud-upload media__upload-icon' />
                    <span className=' media__upload-icon-label'>Drag and Drop Images Here</span>
                </div>
                <div className='col-12 flex justify-content-center align-items-center media__upload-splitter'>
                    <hr className='media__line mr-4 flex-1' />
                    <span>or</span>
                    <hr className='media__line ml-4 flex-1' />
                </div>
            </div>
        );
    };

    const chooseOptions = {
        className: "media__button",
        label: "Choose from files",
        icon: "none",
    };

    return (
        <div className='media grid'>
            <FileUpload
                ref={fileUploadRef}
                multiple
                accept='image/*'
                maxFileSize={limitations.maxSize * 1000000}
                onUpload={onTemplateUpload}
                headerTemplate={chooseTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                onSelect={onTemplateSelect}
                chooseOptions={chooseOptions}
                progressBarTemplate={<></>}
                className='col-12'
            />
            <div className='col-12 mt-4 media-input'>
                <Dropdown className='media-input__dropdown' placeholder='Category' />
                <InputText className='media-input__text' placeholder='Comment' />
                <Button
                    severity={totalCount ? "success" : "secondary"}
                    disabled={!totalCount || isLoading}
                    className='p-button media-input__button'
                    onClick={handleUploadFiles}
                >
                    Save
                </Button>
            </div>
            <div className='media__uploaded media-uploaded'>
                <h2 className='media-uploaded__title uppercase m-0'>uploaded images</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        images.length && "uploaded-count--blue"
                    }`}
                >
                    ({images.length})
                </span>
                <hr className='media-uploaded__line flex-1' />
                <label className='cursor-pointer media-uploaded__label'>
                    <Checkbox
                        checked={checked}
                        onChange={() => {
                            setChecked(!checked);
                        }}
                        className='media-uploaded__checkbox'
                    />
                    Export to Web
                </label>
            </div>
            <div className='media-images'>
                {images.length ? (
                    images.map(({ itemuid, src }) => {
                        return (
                            <div key={itemuid} className='media-images__item'>
                                {checked && (
                                    <Checkbox
                                        checked={false}
                                        className='media-uploaded__checkbox'
                                    />
                                )}

                                <Image
                                    src={src}
                                    alt='inventory-item'
                                    width='75'
                                    height='75'
                                    pt={{
                                        image: {
                                            className: "media-images__image",
                                        },
                                    }}
                                />
                                <div className='media-images__info image-info'>
                                    <div className='image-info__item'>
                                        <span className='image-info__icon'>
                                            <i className='pi pi-th-large' />
                                        </span>
                                        <span className='image-info__text--bold'>Exterior</span>
                                    </div>
                                    <div className='image-info__item'>
                                        <span className='image-info__icon'>
                                            <span className='image-info__icon'>
                                                <i className='pi pi-comment' />
                                            </span>
                                        </span>
                                        <span className='image-info__text'>
                                            Renewed colour and new tires
                                        </span>
                                    </div>
                                    <div className='image-info__item'>
                                        <span className='image-info__icon'>
                                            <i className='pi pi-calendar' />
                                        </span>
                                        <span className='image-info__text'>
                                            10/11/2023 08:51:39
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className='media-images__close'
                                    onClick={() => handleDeleteImage(itemuid)}
                                >
                                    <i className='pi pi-times' />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className='w-full text-center'>No images added yet.</div>
                )}
            </div>
        </div>
    );
});
