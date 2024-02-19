import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useRef, useState } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import {
    FileUpload,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
    FileUploadUploadEvent,
    ItemTemplateOptions,
} from "primereact/fileupload";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";

const SexList = [
    {
        name: "M",
    },
    {
        name: "F",
    },
];

export const ContactsIdentificationInfo = observer((): ReactElement => {
    const [sex, setSex] = useState<string>("");
    const store = useStore().contactStore;
    const { contact, setImagesDL, getImagesDL, removeImagesDL } = store;
    const fileUploadRef = useRef<FileUpload>(null);

    useEffect(() => {
        getImagesDL();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onTemplateSelect = (e: FileUploadSelectEvent) => {};

    const onTemplateUpload = (e: FileUploadUploadEvent) => {};

    const onTemplateRemove = (file: File, callback: Function) => {
        removeImagesDL().then((res) => {
            handleUploadFiles();
        });
        callback();
    };

    const handleUploadFiles = () => {
        setImagesDL().then((res) => {
            if (res) {
                fileUploadRef.current?.clear();
            }
        });
    };

    const handleDeleteImage = () => {
        removeImagesDL().then((res) => {
            handleUploadFiles();
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
                    onClick={handleDeleteImage}
                    className='p-button presentation__remove-button'
                />
            </div>
        );
    };

    const chooseTemplate = ({ chooseButton }: FileUploadHeaderTemplateOptions) => {
        return (
            <div className='col-6 ml-auto flex justify-content-center flex-wrap mb-3'>
                {chooseButton}
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className='grid col-6 ml-auto'>
                <div className='flex align-items-center flex-column col-12'>
                    <i className='pi pi-cloud-upload dl__upload-icon' />
                    <span className='text-center dl__upload-icon-label'>
                        Drag and Drop Images Here
                    </span>
                </div>
                <div className='col-12 flex justify-content-center align-items-center dl__upload-splitter'>
                    <hr className='dl__line mr-4 flex-1' />
                    <span>or</span>
                    <hr className='dl__line ml-4 flex-1' />
                </div>
            </div>
        );
    };

    return (
        <div className='grid address-info row-gap-2'>
            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder="DL's State"
                    value={contact?.extdata?.Buyer_DL_State}
                    options={STATES_LIST}
                    className='w-full identification-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='identification-info__text-input w-full'
                        value={contact?.extdata?.Buyer_Driver_License_Num}
                    />
                    <label className='float-label'>Driver License's Number</label>
                </span>
            </div>

            <div className='col-3 mr-2'>
                <DateInput
                    placeholder="DL's exp. date"
                    value={contact?.extdata?.Buyer_DL_Exp_Date}
                    className='identification-info__date-input w-full'
                />
            </div>

            <div className='col-3'>
                <Dropdown
                    optionLabel='name'
                    optionValue='name'
                    filter
                    placeholder='Sex'
                    value={contact?.extdata?.Buyer_Sex || sex}
                    options={SexList}
                    onChange={({ target: { value } }) => setSex(value)}
                    className='w-full identification-info__dropdown'
                />
            </div>

            <div className='col-3'>
                <span className='p-float-label'>
                    <InputText
                        className='identification-info__text-input w-full'
                        value={contact?.extdata?.Buyer_SS_Number}
                    />
                    <label className='float-label'>Social Security Number</label>
                </span>
            </div>

            <div className='col-3'>
                <DateInput
                    placeholder='Date of Birth'
                    value={contact?.extdata?.Buyer_Date_Of_Birth}
                    className='identification-info__date-input w-full'
                />
            </div>
            <div className='flex col-12'>
                <h3 className='identification__title m-0 pr-3'>Driver license's photos</h3>
                <hr className='identification__line flex-1' />
            </div>

            <div className='col-6 identification-dl'>
                <div className='identification-dl__title'>Frontside</div>
                <FileUpload
                    ref={fileUploadRef}
                    accept='image/*'
                    headerTemplate={chooseTemplate}
                    onUpload={onTemplateUpload}
                    itemTemplate={itemTemplate}
                    emptyTemplate={emptyTemplate}
                    onSelect={onTemplateSelect}
                    progressBarTemplate={<></>}
                    className='col-12'
                />
            </div>
            <div className='col-6 identification-dl'>
                <div className='identification-dl__title'>Backside</div>
                <FileUpload
                    ref={fileUploadRef}
                    accept='image/*'
                    headerTemplate={chooseTemplate}
                    itemTemplate={itemTemplate}
                    emptyTemplate={emptyTemplate}
                    progressBarTemplate={<></>}
                    className='col-12'
                />
            </div>
        </div>
    );
});
