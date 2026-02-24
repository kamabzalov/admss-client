import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router-dom";
import { InfoOverlayPanel } from "dashboard/common/overlay-panel";
import { Button } from "primereact/button";
import {
    FileUpload,
    FileUploadUploadEvent,
    ItemTemplateOptions,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
} from "primereact/fileupload";
import { TextInput } from "dashboard/common/form/inputs";
import { Tag } from "primereact/tag";
import { useStore } from "store/hooks";
import { emptyTemplate } from "dashboard/common/form/upload";
import { useToastMessage } from "common/hooks";
import { ContactDocumentsLimitations } from "common/models/contact";
import { Loader } from "dashboard/common/loader";
import { ContactDocumentTemplate } from "./document-template";
import { TruncatedText } from "dashboard/common/display";
import { UPLOAD_TEXT } from "common/constants/media-categories";

const limitations: ContactDocumentsLimitations = {
    formats: ["PDF", "PNG", "JPEG", "TIFF"],
    maxSize: 8,
    maxUpload: 16,
    maxUploadedDocuments: 50,
};

const isPdf = (file: File) => {
    return file.type === "application/pdf" || file.name?.toLowerCase().includes(".pdf");
};

export const ContactsDocuments = observer((): ReactElement => {
    const { id } = useParams();
    const store = useStore().contactStore;
    const { showError } = useToastMessage();
    const {
        saveContactDocuments,
        uploadFileDocuments,
        documents,
        fetchDocuments,
        clearContactMedia,
        formErrorMessage,
        contact,
    } = store;
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!id || !contact?.contactuid) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const handleFetchDocuments = async () => {
            await fetchDocuments();
            setIsLoading(false);
        };
        handleFetchDocuments();

        return () => {
            clearContactMedia();
        };
    }, [id, contact?.contactuid]);

    useEffect(() => {
        if (formErrorMessage) {
            showError(formErrorMessage);
        }
    }, [formErrorMessage, showError]);

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
            showError(formErrorMessage);
        }
        const response = await saveContactDocuments();

        if (response) {
            fileUploadRef.current?.clear();
            setTotalCount(0);
            store.uploadFileDocuments = {
                file: [],
                data: {
                    notes: "",
                },
            };
            await fetchDocuments();
            setIsLoading(false);
        }
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center presentation'>
                <div className='flex align-items-center'>
                    {isPdf(file) ? (
                        <div className='presentation__icon'>
                            <i className='adms-pdf' />
                        </div>
                    ) : (
                        <img
                            alt={file.name}
                            src={URL.createObjectURL(file)}
                            role='presentation'
                            width={29}
                            height={29}
                            className='presentation__document'
                        />
                    )}
                    <span className='presentation__label flex flex-column text-left ml-3'>
                        <TruncatedText
                            withTooltip
                            tooltipOptions={{
                                position: "top",
                                content: file.name,
                            }}
                            className='presentation__label-text'
                            text={file.name}
                        />
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
                style={{ "--upload-text": `"${UPLOAD_TEXT.IMAGES}"` } as React.CSSProperties}
            />
            <div className='col-12 mt-4 media-input'>
                <TextInput
                    name='notes'
                    label=''
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
            <div className='col-12 media__uploaded media-uploaded'>
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
                {!isLoading && documents?.length ? (
                    documents.map((document) => (
                        <ContactDocumentTemplate
                            key={document.itemuid}
                            setIsLoading={setIsLoading}
                            document={document}
                        />
                    ))
                ) : !isLoading ? (
                    <div className='w-full text-center'>No documents added yet.</div>
                ) : null}
            </div>
        </div>
    );
});
