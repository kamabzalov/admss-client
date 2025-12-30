import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { Button } from "primereact/button";
import { DropdownChangeEvent } from "primereact/dropdown";
import {
    FileUpload,
    FileUploadUploadEvent,
    ItemTemplateOptions,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
} from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { MediaLimitations } from "common/models/inventory";
import { useStore } from "store/hooks";
import { CATEGORIES } from "common/constants/media-categories";
import { Checkbox } from "primereact/checkbox";
import { Image } from "primereact/image";
import { Loader } from "dashboard/common/loader";
import { emptyTemplate } from "dashboard/common/form/upload";
import { ComboBox } from "dashboard/common/form/dropdown";
import { ConfirmModal } from "dashboard/common/dialog/confirm";

const limitations: MediaLimitations = {
    formats: ["PDF"],
    maxSize: 8,
    maxUpload: 16,
    maxMediaCount: 50,
};

enum ModalInfo {
    TITLE = "Are you sure?",
    BODY = "Do you really want to delete this document? This process cannot be undone.",
    ACCEPT = "Delete",
}

export const DocumentsMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        saveInventoryDocuments,
        uploadFileDocuments,
        documents,
        isLoading,
        removeMedia,
        fetchDocuments,
        clearMedia,
    } = store;
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [checked, setChecked] = useState<boolean>(true);
    const [documentChecked, setDocumentChecked] = useState<boolean[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [itemuid, setItemuid] = useState<string>("");

    useEffect(() => {
        fetchDocuments();

        return () => {
            clearMedia();
        };
    }, []);

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileDocuments = {
            ...store.uploadFileDocuments,
            data: {
                ...store.uploadFileDocuments.data,
                contenttype: e.target.value,
            },
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileDocuments = {
            ...store.uploadFileDocuments,
            data: {
                ...store.uploadFileDocuments.data,
                notes: e.target.value,
            },
        };
    };

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.uploadFileDocuments = {
            ...store.uploadFileDocuments,
            file: e.files,
        };
        setTotalCount(e.files.length);
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = {
            file: uploadFileDocuments.file.filter((item) => item.name !== file.name),
            data: uploadFileDocuments.data,
        };
        store.uploadFileDocuments = newFiles;
        setTotalCount(newFiles.file.length);
        callback();
    };

    const handleUploadFiles = () => {
        saveInventoryDocuments().then((res) => {
            if (res) {
                fileUploadRef.current?.clear();
            }
        });
    };

    const handleCheckedChange = (index?: number) => {
        const updatedDocumentChecked = [...documentChecked];

        if (index === undefined && !checked) {
            setChecked(true);
            const allChecked = updatedDocumentChecked.map(() => true);
            setDocumentChecked(allChecked);
        } else if (index === undefined && checked) {
            setChecked(false);
            const allUnchecked = updatedDocumentChecked.map(() => false);
            setDocumentChecked(allUnchecked);
        } else if (index !== undefined) {
            const updatedCheckboxState = [...updatedDocumentChecked];
            updatedCheckboxState[index] = !updatedCheckboxState[index];
            setDocumentChecked(updatedCheckboxState);
        }
    };

    const handleDeleteDocument = (mediauid: string) => {
        removeMedia(mediauid, fetchDocuments);
    };

    const handleModalOpen = (mediauid: string) => {
        setItemuid(mediauid);
        setModalVisible(true);
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
                        className='presentation__document'
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
            <div className='w-full flex justify-content-center flex-wrap mb-3 media-choose'>
                {totalCount ? (
                    <div className='media-choose__selected flex align-items-center'>
                        To upload more drag and drop documents
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
                                <InfoOverlayPanel panelTitle='Limitations:'>
                                    <p>
                                        <b>Supported formats: </b>
                                        {limitations.formats.map((format, index) => (
                                            <span key={index}>
                                                {format}
                                                {index !== limitations.formats.length - 1 && ", "}
                                            </span>
                                        ))}
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

    const chooseOptions = {
        className: "media__button",
        label: "Choose from files",
        icon: "none",
    };

    const documentsSet = new Set();
    const uniqueDocuments = documents.filter((doc) => {
        if (!doc.itemuid || documentsSet.has(doc.itemuid)) return false;
        documentsSet.add(doc.itemuid);
        return true;
    });

    return (
        <div className='media grid'>
            <FileUpload
                ref={fileUploadRef}
                multiple
                accept='document/*'
                maxFileSize={limitations.maxSize * 1000000}
                onUpload={onTemplateUpload}
                headerTemplate={chooseTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate("documents")}
                onSelect={onTemplateSelect}
                chooseOptions={chooseOptions}
                progressBarTemplate={<></>}
                className='col-12'
            />
            <div className='col-12 mt-4 media-input'>
                <ComboBox
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel={"name"}
                    optionValue={"id"}
                    options={[...CATEGORIES]}
                    value={uploadFileDocuments?.data?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <InputText
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileDocuments?.data?.notes || ""}
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
                <h2 className='media-uploaded__title uppercase m-0'>uploaded documents</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        documents.length && "uploaded-count--blue"
                    }`}
                >
                    ({documents.length}/{limitations.maxMediaCount})
                </span>
                <hr className='media-uploaded__line flex-1' />
            </div>
            <div className='media-grid'>
                {isLoading && <Loader />}
                {!isLoading && uniqueDocuments.length ? (
                    uniqueDocuments.map(({ itemuid, src, info }, index: number) => {
                        return (
                            <div key={itemuid} className='media-item media-documents__item'>
                                {checked && (
                                    <Checkbox
                                        checked={documentChecked[index]}
                                        onChange={() => handleCheckedChange(index)}
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
                                            className: "media-documents__image",
                                        },
                                    }}
                                />
                                <div className='media-info'>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <i className='pi pi-th-large' />
                                        </span>
                                        <span className='media-info__text--bold'>
                                            {
                                                CATEGORIES.find(
                                                    (category) => category.id === info?.contenttype
                                                )?.name
                                            }
                                        </span>
                                    </div>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <span className='media-info__icon'>
                                                <i className='pi pi-comment' />
                                            </span>
                                        </span>
                                        <span className='media-info__text'>{info?.notes}</span>
                                    </div>
                                    <div className='media-info__item'>
                                        <span className='media-info__icon'>
                                            <i className='pi pi-calendar' />
                                        </span>
                                        <span className='media-info__text'>{info?.created}</span>
                                    </div>
                                </div>
                                <button
                                    type='button'
                                    className='media-close'
                                    onClick={() => handleModalOpen(itemuid)}
                                >
                                    <i className='pi pi-times' />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className='w-full text-center'>No audio files added yet.</div>
                )}
            </div>

            <ConfirmModal
                visible={!!modalVisible}
                position='top'
                title={ModalInfo.TITLE}
                icon='pi-times-circle'
                bodyMessage={ModalInfo.BODY}
                confirmAction={() => {
                    handleDeleteDocument(itemuid);
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
