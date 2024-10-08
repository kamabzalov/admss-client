/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from "mobx-react-lite";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { ReactElement, useEffect, useRef } from "react";
import "./index.css";
import { DateInput } from "dashboard/common/form/inputs";
import {
    FileUpload,
    FileUploadHeaderTemplateOptions,
    FileUploadSelectEvent,
} from "primereact/fileupload";
import { Button } from "primereact/button";
import { useStore } from "store/hooks";
import { STATES_LIST } from "common/constants/states";
import { DLSide } from "store/stores/contact";
import { useParams } from "react-router-dom";
import { Loader } from "dashboard/common/loader";
import { BaseResponseError, Status } from "common/models/base-response";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { GENERAL_CONTACT_TYPE } from "dashboard/contacts/form/general-info";
import dlFrontImage from "assets/images/empty_front_dl.svg";
import dlBackImage from "assets/images/empty_back_dl.svg";
import uploadImage from "assets/images/upload.svg";

const SexList = [
    {
        name: "M",
    },
    {
        name: "F",
    },
];

enum DLSides {
    FRONT = "front",
    BACK = "back",
}

const { BUYER, CO_BUYER } = GENERAL_CONTACT_TYPE;

interface ContactsIdentificationInfoProps {
    type?: typeof BUYER | typeof CO_BUYER;
}

export const ContactsIdentificationInfo = observer(
    ({ type }: ContactsIdentificationInfoProps): ReactElement => {
        const { id } = useParams();
        const store = useStore().contactStore;
        const {
            contact,
            contactExtData,
            changeContact,
            changeContactExtData,
            frontSideDL,
            backSideDL,
            getImagesDL,
            removeImagesDL,
            frontSideDLurl,
            backSideDLurl,
            isLoading,
        } = store;
        const toast = useToast();
        const fileUploadFrontRef = useRef<FileUpload>(null);
        const fileUploadBackRef = useRef<FileUpload>(null);

        useEffect(() => {
            getImagesDL();
        }, [contact]);

        useEffect(() => {
            if (frontSideDL.size) {
                store.frontSideDLurl = URL.createObjectURL(frontSideDL);
            }

            if (backSideDL.size) {
                store.backSideDLurl = URL.createObjectURL(backSideDL);
            }
        }, []);

        const onTemplateSelect = (e: FileUploadSelectEvent, side: DLSide) => {
            if (side === DLSides.FRONT) {
                store.frontSideDL = e.files[0];
            }
            if (side === DLSides.BACK) {
                store.backSideDL = e.files[0];
            }
        };

        const handleDeleteImage = (side: DLSide, withRequest?: boolean) => {
            if (side === DLSides.FRONT) {
                fileUploadFrontRef.current?.clear();
                store.frontSideDL = {} as File;
                changeContact("dluidfront", "");
            } else {
                fileUploadBackRef.current?.clear();
                store.backSideDL = {} as File;
                changeContact("dluidback", "");
            }

            if (withRequest) {
                removeImagesDL(side).then((response) => {
                    if (response?.status === Status.ERROR) {
                        const { error, status } = response as BaseResponseError;
                        toast.current?.show({
                            severity: "error",
                            summary: status,
                            detail: error,
                            life: TOAST_LIFETIME,
                        });
                    }
                });
            }
        };

        const itemTemplate = (image: File | string, side: DLSide) => {
            const isFilePath = typeof image === "string";
            const alt = isFilePath ? "driven license" : image?.name;
            const src = isFilePath ? image : URL.createObjectURL(image);
            return (
                <div className='flex align-items-center dl-presentation relative'>
                    <img
                        alt={alt}
                        src={src}
                        role='presentation'
                        className='dl-presentation__image'
                    />
                    <Button
                        type='button'
                        icon='pi pi-times'
                        onClick={() => handleDeleteImage(side, isFilePath)}
                        className='p-button dl-presentation__remove-button'
                    />
                </div>
            );
        };

        const chooseTemplate = (
            { chooseButton }: FileUploadHeaderTemplateOptions,
            side: DLSide
        ) => {
            const { size } = side === DLSides.FRONT ? frontSideDL : backSideDL;
            return (
                <div
                    className={`col-6 flex justify-content-center ml-auto flex-wrap mb-3 dl-header ${
                        size ? "dl-header__active" : ""
                    }`}
                >
                    {chooseButton}
                </div>
            );
        };

        const emptyTemplate = (side: DLSide) => {
            return (
                <div className='grid upload-empty'>
                    <div className='col-6 flex align-items-center justify-content-center upload-empty__image'>
                        <img
                            alt={`empty ${DLSides.FRONT} DL`}
                            src={side === DLSides.FRONT ? dlFrontImage : dlBackImage}
                        />
                    </div>
                    <div className='col-6 flex align-items-center flex-column'>
                        <img alt='upload icon' src={uploadImage} className='upload-empty__icon' />
                        <span className='text-center dl__upload-icon-label'>
                            Drag and Drop Images Here
                        </span>
                        <div className='col-12 flex justify-content-center align-items-center dl__upload-splitter'>
                            <hr className='dl__line mr-4 flex-1' />
                            <span>or</span>
                            <hr className='dl__line ml-4 flex-1' />
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className='grid address-info row-gap-2'>
                <div className='grid address-info row-gap-2'>
                    <div className='col-3'>
                        <span className='p-float-label'>
                            <Dropdown
                                optionLabel='label'
                                optionValue='id'
                                filter
                                value={
                                    (type === BUYER
                                        ? contactExtData.Buyer_DL_State
                                        : contactExtData.CoBuyer_DL_State) || ""
                                }
                                options={STATES_LIST}
                                onChange={({ target: { value } }) =>
                                    changeContactExtData(
                                        type === BUYER ? "Buyer_DL_State" : "CoBuyer_DL_State",
                                        value
                                    )
                                }
                                className='w-full identification-info__dropdown'
                            />
                            <label className='float-label'>DL's State</label>
                        </span>
                    </div>

                    <div className='col-3'>
                        <span className='p-float-label'>
                            <InputText
                                className='identification-info__text-input w-full'
                                value={
                                    type === BUYER
                                        ? contactExtData.Buyer_Driver_License_Num
                                        : contactExtData.CoBuyer_Driver_License_Num
                                }
                                onChange={({ target: { value } }) => {
                                    changeContactExtData(
                                        type === BUYER
                                            ? "Buyer_Driver_License_Num"
                                            : "CoBuyer_Driver_License_Num",
                                        value
                                    );
                                }}
                            />
                            <label className='float-label'>Driver License's Number</label>
                        </span>
                    </div>

                    <div className='col-3 mr-2'>
                        <DateInput
                            name="DL's exp. date"
                            value={
                                (type === BUYER
                                    ? contactExtData.Buyer_DL_Exp_Date
                                    : contactExtData.CoBuyer_DL_Exp_Date) || ""
                            }
                            onChange={({ target: { value } }) =>
                                changeContactExtData(
                                    type === BUYER ? "Buyer_DL_Exp_Date" : "CoBuyer_DL_Exp_Date",
                                    Date.parse(String(value))
                                )
                            }
                            className='identification-info__date-input w-full'
                        />
                    </div>

                    <div className='col-3'>
                        <span className='p-float-label'>
                            <Dropdown
                                optionLabel='name'
                                optionValue='name'
                                filter
                                value={
                                    (type === BUYER
                                        ? contactExtData.Buyer_Sex
                                        : contactExtData.CoBuyer_Sex) || ""
                                }
                                options={SexList}
                                onChange={({ target: { value } }) =>
                                    changeContactExtData(
                                        type === BUYER ? "Buyer_Sex" : "CoBuyer_Sex",
                                        value
                                    )
                                }
                                className='w-full identification-info__dropdown'
                            />
                            <label className='float-label'>Sex</label>
                        </span>
                    </div>

                    <div className='col-3'>
                        <span className='p-float-label'>
                            <InputText
                                className='identification-info__text-input w-full'
                                value={
                                    (type === BUYER
                                        ? contactExtData.Buyer_SS_Number
                                        : contactExtData.CoBuyer_SS_Number) || ""
                                }
                                onChange={({ target: { value } }) => {
                                    changeContactExtData(
                                        type === BUYER ? "Buyer_SS_Number" : "CoBuyer_SS_Number",
                                        value
                                    );
                                }}
                            />
                            <label className='float-label'>Social Security Number</label>
                        </span>
                    </div>

                    <div className='col-3'>
                        <DateInput
                            name='Date of Birth'
                            value={
                                (type === BUYER
                                    ? contactExtData.Buyer_Date_Of_Birth
                                    : contactExtData.CoBuyer_Date_Of_Birth) || ""
                            }
                            onChange={({ target: { value } }) =>
                                changeContactExtData(
                                    type === BUYER
                                        ? "Buyer_Date_Of_Birth"
                                        : "CoBuyer_Date_Of_Birth",
                                    Date.parse(String(value))
                                )
                            }
                            className='identification-info__date-input w-full'
                        />
                    </div>
                </div>
                {id && (
                    <>
                        <div className='flex col-12'>
                            <h3 className='identification__title m-0 pr-3'>
                                Driver license's photos
                            </h3>
                            <hr className='identification__line flex-1' />
                        </div>

                        <div
                            className={`col-6 identification-dl ${
                                frontSideDL.size ? "identification-dl__active" : ""
                            }`}
                        >
                            <div className='identification-dl__title'>Frontside</div>
                            {frontSideDLurl && isLoading ? (
                                <Loader size='large' />
                            ) : frontSideDLurl ? (
                                itemTemplate(frontSideDLurl, DLSides.FRONT)
                            ) : (
                                <FileUpload
                                    ref={fileUploadFrontRef}
                                    accept='image/*'
                                    headerTemplate={(props) => chooseTemplate(props, DLSides.FRONT)}
                                    chooseLabel='Choose from files'
                                    chooseOptions={{
                                        icon: <></>,
                                    }}
                                    itemTemplate={(file) =>
                                        itemTemplate(file as File, DLSides.FRONT)
                                    }
                                    emptyTemplate={emptyTemplate(DLSides.FRONT)}
                                    onSelect={(event) => onTemplateSelect(event, DLSides.FRONT)}
                                    progressBarTemplate={<></>}
                                    className='contact-upload'
                                />
                            )}
                        </div>
                        <div
                            className={`col-6 identification-dl ${
                                backSideDL.size ? "identification-dl__active" : ""
                            }`}
                        >
                            <div className='identification-dl__title'>Backside</div>
                            {backSideDLurl && isLoading ? (
                                <Loader size='large' />
                            ) : backSideDLurl ? (
                                itemTemplate(backSideDLurl, DLSides.BACK)
                            ) : (
                                <FileUpload
                                    ref={fileUploadBackRef}
                                    accept='image/*'
                                    headerTemplate={(props) => chooseTemplate(props, DLSides.BACK)}
                                    chooseLabel='Choose from files'
                                    chooseOptions={{
                                        icon: <></>,
                                    }}
                                    itemTemplate={(file) =>
                                        itemTemplate(file as File, DLSides.BACK)
                                    }
                                    emptyTemplate={emptyTemplate(DLSides.BACK)}
                                    onSelect={(event) => onTemplateSelect(event, DLSides.BACK)}
                                    className='contact-upload'
                                    progressBarTemplate={<></>}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    }
);
