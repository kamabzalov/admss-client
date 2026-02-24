import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
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
import { DropdownChangeEvent } from "primereact/dropdown";
import { TextInput } from "dashboard/common/form/inputs";
import { useStore } from "store/hooks";
import { Image } from "primereact/image";
import { Checkbox } from "primereact/checkbox";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { InventoryMediaPostData, MediaLimitations } from "common/models/inventory";
import { Layout, Responsive, WidthProvider } from "react-grid-layout";
import { CATEGORIES, UPLOAD_TEXT } from "common/constants/media-categories";
import { Loader } from "dashboard/common/loader";
import { emptyTemplate } from "dashboard/common/form/upload";
import { ComboBox } from "dashboard/common/form/dropdown";
import { ConfirmModal } from "dashboard/common/dialog/confirm";
import { useToastMessage } from "common/hooks";
import { TruncatedText } from "dashboard/common/display";

const limitations: MediaLimitations = {
    formats: ["PNG", "JPEG", "TIFF"],
    minResolution: "512x512",
    maxResolution: "8192x8192",
    maxSize: 8,
    maxUpload: 16,
    maxMediaCount: 99,
};

enum ModalInfo {
    TITLE = "Are you sure?",
    BODY = "Do you really want to delete this image? This process cannot be undone.",
    ACCEPT = "Delete",
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const ImagesMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        saveInventoryImages,
        uploadFileImages,
        images,
        isLoading,
        removeMedia,
        fetchImages,
        changeInventoryMediaOrder,
        clearMedia,
        formErrorMessage,
    } = store;
    const [checked, setChecked] = useState<boolean>(true);
    const [imagesChecked, setImagesChecked] = useState<boolean[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [itemuid, setItemuid] = useState<string>("");
    const { showError } = useToastMessage();

    useEffect(() => {
        fetchImages();

        return () => {
            clearMedia();
        };
    }, []);

    useEffect(() => {
        if (images.length !== imagesChecked.length) {
            const newCheckedState = new Array(images.length).fill(true);
            setImagesChecked(newCheckedState);
        }
    }, [images.length]);

    useEffect(() => {
        if (formErrorMessage) {
            showError(formErrorMessage);
        }
    }, [formErrorMessage, showError]);

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.uploadFileImages = {
            ...store.uploadFileImages,
            file: e.files,
        };
        setTotalCount(e.files.length);
    };

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileImages = {
            ...store.uploadFileImages,
            data: {
                ...store.uploadFileImages.data,
                contenttype: e.target.value,
            },
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileImages = {
            ...store.uploadFileImages,
            data: {
                ...store.uploadFileImages.data,
                notes: e.target.value,
            },
        };
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = {
            file: uploadFileImages.file.filter((item) => item.name !== file.name),
            data: uploadFileImages.data,
        };
        store.uploadFileImages = newFiles;
        setTotalCount(newFiles.file.length);
        callback();
    };

    const handleUploadFiles = async () => {
        if (formErrorMessage) {
            showError(formErrorMessage);
            return;
        }
        const res = await saveInventoryImages();
        if (res) {
            fileUploadRef.current?.clear();
            store.resetUploadState();
            fetchImages();
            setTotalCount(0);
            setImagesChecked([]);
            setChecked(true);
        }
    };

    const handleCheckedChange = (index?: number) => {
        const updatedImagesChecked = [...imagesChecked];

        if (index === undefined && !checked) {
            setChecked(true);
            const allChecked = updatedImagesChecked.map(() => true);
            setImagesChecked(allChecked);
        } else if (index === undefined && checked) {
            setChecked(false);
            const allUnchecked = updatedImagesChecked.map(() => false);
            setImagesChecked(allUnchecked);
        } else if (index !== undefined) {
            const updatedCheckboxState = [...updatedImagesChecked];
            updatedCheckboxState[index] = !updatedCheckboxState[index];
            setImagesChecked(updatedCheckboxState);
        }
    };

    const handleModalOpen = (mediauid: string) => {
        setItemuid(mediauid);
        setModalVisible(true);
    };

    const handleDeleteImage = (mediauid: string) => {
        removeMedia(mediauid, fetchImages);
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center presentation'>
                <div className='presentation__content'>
                    <img
                        alt={file.name}
                        src={URL.createObjectURL(file)}
                        role='presentation'
                        width={29}
                        height={29}
                        className='presentation__image'
                    />
                    <TruncatedText className='presentation__label' text={file.name} withTooltip />
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
            <div className='w-full flex justify-content-center flex-wrap mb-3 media-choose'>
                {totalCount ? (
                    <div className='media-choose__selected flex align-items-center'>
                        To upload more drag and drop images
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
                                </InfoOverlayPanel>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const handleChangeOrder = (list: Layout[]) => {
        const orderedList: Pick<InventoryMediaPostData, "itemuid" | "order">[] = [];
        if (list) {
            list.forEach((item: Layout) => {
                orderedList.push({ itemuid: item.i, order: item.y + 1 * item.x + 1 });
            });
        }
        changeInventoryMediaOrder(orderedList);
    };

    const chooseOptions = {
        className: "media__button",
        label: "Choose from files",
        icon: "none",
    };

    const layoutItems = images
        .filter((img) => img.itemuid !== undefined && img.itemuid !== null)
        .map(({ itemuid }, index) => ({
            i: String(itemuid),
            x: index % 3,
            y: Math.floor(index / 3),
            w: 1,
            h: 4,
        }));

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
                emptyTemplate={emptyTemplate("images")}
                onSelect={onTemplateSelect}
                chooseOptions={chooseOptions}
                progressBarTemplate={<></>}
                className='col-12'
                style={{ "--upload-text": `"${UPLOAD_TEXT.IMAGES}"` } as React.CSSProperties}
            />
            <div className='col-12 mt-4 media-input'>
                <ComboBox
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel={"name"}
                    optionValue={"id"}
                    options={[...CATEGORIES]}
                    value={uploadFileImages?.data?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <TextInput
                    name='comment'
                    label='Comment'
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileImages?.data?.notes || ""}
                    onChange={handleCommentaryChange}
                />
                <Button
                    severity={totalCount ? "success" : "secondary"}
                    disabled={!totalCount || isLoading}
                    className='p-button media-input__button'
                    onClick={handleUploadFiles}
                >
                    Save
                </Button>
            </div>
            <div className='col-12 media__uploaded media-uploaded'>
                <h2 className='media-uploaded__title uppercase m-0'>uploaded images</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        images.length && "uploaded-count--blue"
                    }`}
                >
                    ({images.length}/{limitations.maxMediaCount})
                </span>
                <hr className='media-uploaded__line flex-1' />
                <label className='cursor-pointer media-uploaded__label'>
                    <Checkbox
                        checked={imagesChecked.every((checked) => checked) && checked}
                        onChange={() => handleCheckedChange()}
                        className='media-uploaded__checkbox'
                    />
                    Export to Web
                </label>
            </div>
            <div className='media-grid'>
                {isLoading && <Loader />}
                {!isLoading && images?.length ? (
                    <ResponsiveReactGridLayout
                        isDraggable={true}
                        isDroppable={true}
                        className='layout w-full relative'
                        onDragStop={(item) => handleChangeOrder(item)}
                        layouts={{ lg: layoutItems }}
                        cols={{ lg: 3, md: 3, sm: 3, xs: 2, xxs: 1 }}
                        draggableCancel='
                        .media-uploaded__checkbox,
                        .media-close,
                        .p-image,
                        .p-image-mask,
                        .media-images__preview'
                        rowHeight={20}
                    >
                        {images.map(({ itemuid, src, info }, index: number) => {
                            return (
                                <div key={itemuid} className='media-item media-images__item'>
                                    {checked && (
                                        <Checkbox
                                            checked={imagesChecked[index]}
                                            onChange={() => handleCheckedChange(index)}
                                            className='media-uploaded__checkbox'
                                        />
                                    )}
                                    <Image
                                        src={src}
                                        alt='inventory-item'
                                        width='75'
                                        height='75'
                                        preview
                                        className='cursor-pointer'
                                        pt={{
                                            image: {
                                                className: "media-images__image",
                                            },
                                            previewContainer: {
                                                className: "media-images__preview-container",
                                            },
                                            preview: {
                                                className: "media-images__preview",
                                            },
                                        }}
                                    />
                                    <div className='media-info'>
                                        <div className='media-info__item'>
                                            <span className='media-info__icon'>
                                                <i className='icon adms-category' />
                                            </span>
                                            <span className='media-info__text--bold'>
                                                {
                                                    CATEGORIES.find(
                                                        (category) =>
                                                            category.id === info?.contenttype
                                                    )?.name
                                                }
                                            </span>
                                        </div>
                                        <div className='media-info__item'>
                                            <span className='media-info__icon'>
                                                <span className='media-info__icon'>
                                                    <i className='icon adms-comment' />
                                                </span>
                                            </span>
                                            <span className='media-info__text'>{info?.notes}</span>
                                        </div>
                                        <div className='media-info__item'>
                                            <span className='media-info__icon'>
                                                <i className='icon adms-calendar' />
                                            </span>
                                            <span className='media-info__text'>
                                                {info?.created}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type='button'
                                        className={`media-close ${imagesChecked[index] ? "media-close--green" : ""}`}
                                        onClick={() => handleModalOpen(itemuid)}
                                    >
                                        <i className='pi pi-times' />
                                    </button>
                                </div>
                            );
                        })}
                    </ResponsiveReactGridLayout>
                ) : (
                    <div className='w-full text-center'>No images added yet.</div>
                )}
            </div>
            <ConfirmModal
                visible={!!modalVisible}
                position='top'
                title={ModalInfo.TITLE}
                icon='pi-times-circle'
                bodyMessage={ModalInfo.BODY}
                confirmAction={() => {
                    handleDeleteImage(itemuid);
                    setModalVisible(false);
                }}
                draggable={false}
                rejectLabel={"Cancel"}
                acceptLabel={ModalInfo.ACCEPT}
                className={`media-warning`}
                onHide={() => setModalVisible(false)}
            />
        </div>
    );
});
