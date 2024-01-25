import "./index.css";
import { ReactElement, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { Toast } from "primereact/toast";
import { FileUpload, FileUploadUploadEvent, ItemTemplateOptions } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";

export const ImagesMedia = observer((): ReactElement => {
    const toast = useRef<Toast>(null);
    const [totalSize, setTotalSize] = useState(0);

    const fileUploadRef = useRef<FileUpload>(null);

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        let _totalSize = 0;

        e.files.forEach((file) => {
            _totalSize += file.size || 0;
        });

        setTotalSize(_totalSize);
        toast.current?.show({ severity: "info", summary: "Success", detail: "File Uploaded" });
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        setTotalSize(totalSize - file.size);
        callback();
    };

    const itemTemplate = (inFile: object, props: ItemTemplateOptions) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center'>
                <div className='flex align-items-center'>
                    <img
                        alt={file.name}
                        src={URL.createObjectURL(file)}
                        role='presentation'
                        width={100}
                    />
                    <span className='flex flex-column text-left ml-3'>{file.name}</span>
                </div>
                <Button
                    type='button'
                    icon='pi pi-times'
                    className='p-button media__remove-button'
                    onClick={() => onTemplateRemove(file, props.onRemove)}
                />
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
                <div className='w-full flex justify-content-center flex-wrap mt-4'>
                    <Button type='button' className='p-button media__button' onClick={() => {}}>
                        Choose from files
                    </Button>
                    <div className='flex w-full justify-content-center align-items-center mt-4'>
                        <span className='media__upload-text-info media__upload-text-info--bold'>
                            Up to 16 items
                        </span>
                        <span className='media__upload-text-info'>Maximal size is 8 Mb</span>
                        <Tag className='media__upload-tag' value='png' />
                        <Tag className='media__upload-tag' value='jpeg' />
                        <Tag className='media__upload-tag' value='tiff' />
                    </div>
                </div>
            </div>
        );
    };

    const chooseOptions = {
        icon: "pi pi-fw pi-images",
        className: "button-primary",
    };
    const uploadOptions = {
        icon: "pi pi-fw pi-cloud-upload",
        className: "custom-upload-btn p-button-success p-button-rounded p-button-outlined",
    };
    const cancelOptions = {
        icon: "pi pi-fw pi-times",
        className: "custom-cancel-btn p-button-danger p-button-rounded p-button-outlined",
    };

    return (
        <div className='media grid'>
            <FileUpload
                ref={fileUploadRef}
                name='demo[]'
                multiple
                accept='image/*'
                maxFileSize={8000000}
                onUpload={onTemplateUpload}
                headerTemplate={<></>}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions}
                className='col-12'
                pt={{
                    content: {},
                }}
            />
            <div className='col-12 mt-4 media-input'>
                <Dropdown className='media-input__dropdown' placeholder='Category' />
                <InputText className='media-input__text' placeholder='Comment' />
                <Button severity='secondary' className='p-button media-input__button'>
                    Save
                </Button>
            </div>
            <div className='media__uploaded media-uploaded'>
                <h2 className='media-uploaded__title uppercase m-0'>uploaded images</h2>
                <span className='media-uploaded__label mx-2'>(0)</span>
                <hr className='media-uploaded__line flex-1' />
            </div>
            <div className='media__images'>No images added yet.</div>
        </div>
    );
});
