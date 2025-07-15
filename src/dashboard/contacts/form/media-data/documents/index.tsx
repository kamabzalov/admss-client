import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { Button } from "primereact/button";
import {
    FileUpload,
    FileUploadUploadEvent,
    ItemTemplateOptions,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
} from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useStore } from "store/hooks";
import { Image } from "primereact/image";
import { emptyTemplate } from "dashboard/common/form/upload";
import { useToast } from "dashboard/common/toast";
import { ContactDocumentsLimitations } from "common/models/contact";
import { Loader } from "dashboard/common/loader";

const limitations: ContactDocumentsLimitations = {
    formats: ["PDF", "PNG", "JPEG", "TIFF"],
    maxSize: 8,
    maxUpload: 16,
    maxUploadedDocuments: 50,
};

export const ContactsDocuments = observer((): ReactElement => {
    const store = useStore().contactStore;
    const toast = useToast();
    const {
        saveContactDocuments,
        uploadFileDocuments,
        documents,
        removeContactMedia,
        fetchDocuments,
        clearContactMedia,
        formErrorMessage,
    } = store;
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const handleFetchDocuments = async () => {
            await fetchDocuments();
            setIsLoading(false);
        };
        handleFetchDocuments();

        return () => {
            clearContactMedia();
        };
    }, []);

    useEffect(() => {
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
        }
    }, [formErrorMessage, toast]);

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
        setIsLoading(true);
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

    const handleUploadFiles = async () => {
        setIsLoading(true);
        if (formErrorMessage) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: formErrorMessage,
            });
        }
        const response = await saveContactDocuments();

        if (response) {
            fileUploadRef.current?.clear();
            fetchDocuments();
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = (mediauid: string) => {
        removeContactMedia(mediauid, fetchDocuments);
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
            <div className='w-full flex justify-content-center flex-wrap mb-3 document-choose'>
                {totalCount ? (
                    <div className='document-choose__selected flex align-items-center'>
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
                <InputText
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileDocuments?.data?.notes || ""}
                    onChange={handleCommentaryChange}
                />
                <Button
                    severity={totalCount && !isLoading ? "success" : "secondary"}
                    disabled={!totalCount || isLoading}
                    className='p-button media-input__button'
                    onClick={handleUploadFiles}
                    type='button'
                >
                    Save
                </Button>
            </div>
            <div className='media__uploaded media-uploaded'>
                <h2 className='media-uploaded__title uppercase m-0'>uploaded documents</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        documents?.length && "uploaded-count--blue"
                    }`}
                >
                    ({documents?.length || 0}/{limitations.maxUploadedDocuments})
                </span>
                <hr className='media-uploaded__line flex-1' />
            </div>
            <div className='media-documents'>
                {isLoading && <Loader />}
                {documents?.length ? (
                    documents.map(({ itemuid, src, notes, created }, index: number) => {
                        return (
                            <div key={itemuid} className='media-documents__item'>
                                <Image
                                    src={src}
                                    alt='contact-document'
                                    width='75'
                                    height='75'
                                    pt={{
                                        image: {
                                            className: "media-documents__image",
                                        },
                                    }}
                                />
                                <div className='media-documents__info document-info'>
                                    <div className='document-info__item'>
                                        <span className='document-info__icon'>
                                            <span className='document-info__icon'>
                                                <i className='pi pi-comment' />
                                            </span>
                                        </span>
                                        <span className='document-info__text'>{notes}</span>
                                    </div>
                                    <div className='document-info__item'>
                                        <span className='document-info__icon'>
                                            <i className='pi pi-calendar' />
                                        </span>
                                        <span className='document-info__text'>{created}</span>
                                    </div>
                                </div>
                                <button
                                    className='media-documents__close'
                                    type='button'
                                    onClick={() => handleDeleteDocument(itemuid || "")}
                                >
                                    <i className='pi pi-times' />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div className='w-full text-center'>No documents added yet.</div>
                )}
            </div>
        </div>
    );
});
