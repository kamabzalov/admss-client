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
import { getInventoryMediaItem } from "http/services/inventory-service";
import { Image } from "primereact/image";
import { Checkbox } from "primereact/checkbox";

export const ImagesMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const { inventoryImagesID, saveInventoryImages, fileImages } = store;
    const [images, setImages] = useState<string[]>([]);
    const [checked, setChecked] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);

    useEffect(() => {
        inventoryImagesID.forEach((image) => {
            image &&
                getInventoryMediaItem(image).then((item: any) => {
                    setImages((prev) => [...prev, item]);
                });
        });
    }, [inventoryImagesID]);

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.fileImages = e.files;
        setTotalCount(e.files.length);
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = fileImages.filter((item) => item.name !== file.name);
        store.fileImages = newFiles;
        setTotalCount(newFiles.length);
        callback();
    };

    const handleUploadFiles = () => {
        saveInventoryImages().then((res) => {
            if (res) {
                store.fileImages = [];
                fileUploadRef.current?.clear();
            }
        });
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
                        <div className='flex w-full justify-content-center align-items-center mt-4'>
                            <span className='media__upload-text-info media__upload-text-info--bold'>
                                Up to {} items
                            </span>
                            <span className='media__upload-text-info'>Maximal size is 8 Mb</span>
                            <Tag className='media__upload-tag' value='png' />
                            <Tag className='media__upload-tag' value='jpeg' />
                            <Tag className='media__upload-tag' value='tiff' />
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
                maxFileSize={8000000}
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
                    disabled={!totalCount}
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
                    images.map((image) => {
                        return (
                            <div key={image} className='media-images__item'>
                                {checked && (
                                    <Checkbox
                                        checked={false}
                                        className='media-uploaded__checkbox'
                                    />
                                )}

                                <Image
                                    src={image}
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
                                <div className='media-images__close'>
                                    <i className='pi pi-times' />
                                </div>
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
