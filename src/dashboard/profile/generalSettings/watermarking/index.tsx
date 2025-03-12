import "./index.css";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { FileUpload, FileUploadHeaderTemplateOptions } from "primereact/fileupload";
import { MediaLimits } from "common/models";
import { Tag } from "primereact/tag";
import { InputNumber } from "primereact/inputnumber";
import { Accordion, AccordionTab } from "primereact/accordion";
import { getWatermark } from "http/services/settings.service";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { useStore } from "store/hooks";
import { GeneralSettings } from "common/models/general-settings";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

const limitations: MediaLimits = {
    formats: ["PNG", "JPEG"],
    maxResolution: "1200x1200",
    maxSize: 2,
};

type LogoSettings = Partial<Pick<GeneralSettings, "logoenabled" | "logoposX" | "logoposY">>;
type TextBlock = {
    text: string;
    fontName: string;
    fontSize: number | string;
    posX: number;
    posY: number;
};

const mockTextBlock: TextBlock[] = [
    {
        text: "text",
        fontName: "Arial",
        fontSize: 12,
        posX: 40,
        posY: 40,
    },
];

export const SettingsWatermarking = observer(() => {
    const store = useStore().generalSettingsStore;
    const { settings } = store;
    const [enableWatermark, setEnableWatermark] = useState<boolean>(false);
    const [logoSettings, setLogoSettings] = useState<LogoSettings>({ logoenabled: 0 });
    const [textBlocks, setTextBlocks] = useState<TextBlock[]>(mockTextBlock);
    const fileUploadRef = useRef<FileUpload>(null);
    const toast = useToast();

    const renderTextBlocks = () => {
        const header = (blockIndex: number) => {
            return (
                <div className='flex align-items-center justify-content-between w-full'>
                    {`TEXT BLOCK ${blockIndex + 1}`}
                    <div className='watermarking__accordion-header-buttons'>
                        <Button
                            label='Clear'
                            text
                            className='watermarking__clear-button'
                            disabled={textBlocks[blockIndex].text.length === 0}
                            severity={
                                textBlocks[blockIndex].text.length === 0 ? "secondary" : "success"
                            }
                            onClick={(e) => {
                                e.stopPropagation();
                                setTextBlocks((prev) => {
                                    const newTextBlocks = [...prev];
                                    newTextBlocks[blockIndex] = {
                                        text: "",
                                        fontName: "",
                                        fontSize: 0,
                                        posX: 0,
                                        posY: 0,
                                    };
                                    return newTextBlocks;
                                });
                            }}
                        />
                        <Button
                            icon='icon adms-close'
                            className='watermarking__remove-button'
                            text
                            onClick={(e) => {
                                e.stopPropagation();
                                setTextBlocks(textBlocks.filter((_, i) => i !== blockIndex));
                            }}
                        />
                    </div>
                </div>
            );
        };

        return textBlocks.map((block, index) => (
            <AccordionTab
                header={header(index)}
                key={index}
                className='watermarking__accordion-tab'
                contentClassName='watermarking__accordion-content'
            >
                <p className='grid gap-3 mt-0'>
                    <span className='col-12 p-0 p-float-label watermarking__textarea'>
                        <InputTextarea
                            value={block.text}
                            onChange={(e) =>
                                setTextBlocks((prev) => {
                                    const newTextBlocks = [...prev];
                                    newTextBlocks[index] = { ...block, text: e.target.value };
                                    return newTextBlocks;
                                })
                            }
                        />
                        <label className='float-label'>Text</label>
                    </span>
                    <div className='col-12 p-0 flex align-items-center justify-content-between'>
                        <span className='p-float-label watermarking__font-input'>
                            <InputText
                                value={block.fontName}
                                onChange={(e) =>
                                    setTextBlocks((prev) => {
                                        const newTextBlocks = [...prev];
                                        newTextBlocks[index] = {
                                            ...block,
                                            fontName: e.target.value,
                                        };
                                        return newTextBlocks;
                                    })
                                }
                            />
                            <label className='float-label'>Font name</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={Number(block.fontSize)}
                                onChange={(e) =>
                                    setTextBlocks((prev) => {
                                        const newTextBlocks = [...prev];
                                        newTextBlocks[index] = {
                                            ...block,
                                            fontSize: Number(e.value),
                                        };
                                        return newTextBlocks;
                                    })
                                }
                            />
                            <label className='float-label'>Font size</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={block.posX}
                                onChange={(e) =>
                                    setTextBlocks((prev) => {
                                        const newTextBlocks = [...prev];
                                        newTextBlocks[index] = { ...block, posX: Number(e.value) };
                                        return newTextBlocks;
                                    })
                                }
                            />
                            <label className='float-label'>PosX</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={block.posY}
                                onChange={(e) =>
                                    setTextBlocks((prev) => {
                                        const newTextBlocks = [...prev];
                                        newTextBlocks[index] = { ...block, posY: Number(e.value) };
                                        return newTextBlocks;
                                    })
                                }
                            />
                            <label className='float-label'>PosY</label>
                        </span>
                    </div>
                </p>
            </AccordionTab>
        ));
    };

    const handleAddTextBlock = () => {
        setTextBlocks([
            ...textBlocks,
            {
                text: "",
                fontName: "",
                fontSize: 0,
                posX: 0,
                posY: 0,
            },
        ]);
    };

    const handleGetWatermark = async () => {
        if (!settings.logomediauid) return;
        const watermark = await getWatermark(settings.logomediauid);
        if (watermark.error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: watermark.error,
                life: TOAST_LIFETIME,
            });
        } else {
            const { logoenabled, logoposX, logoposY } = settings;
            setLogoSettings({
                logoenabled,
                logoposX,
                logoposY,
            });
        }
    };

    useEffect(() => {
        handleGetWatermark();
    }, [settings]);

    const itemTemplate = (inFile: object) => {
        const file = inFile as File;
        return (
            <div className='flex align-items-center presentation'>
                <div className='flex align-items-center w-full'>
                    <img
                        alt={file.name}
                        src={URL.createObjectURL(file)}
                        role='presentation'
                        width={"100%"}
                        height={"100%"}
                        className='presentation__image'
                    />
                </div>
                <Button
                    type='button'
                    icon='pi pi-times'
                    className='p-button presentation__remove-button'
                    onClick={() => fileUploadRef.current?.clear()}
                />
            </div>
        );
    };

    const chooseTemplate = ({ chooseButton }: FileUploadHeaderTemplateOptions) => (
        <>
            <div className='image-choose'>{chooseButton}</div>
            <div className='upload-info'>
                <span className='media__upload-text-info'>
                    Max resolution: {limitations.maxResolution}px
                </span>
                <span className='media__upload-text-info'>
                    Max size is {limitations.maxSize} Mb
                </span>
                <div className='media__upload-formats'>
                    {limitations.formats.map((format) => (
                        <Tag key={format} className='media__upload-tag' value={format} />
                    ))}
                </div>
            </div>
        </>
    );

    const emptyTemplate = () => {
        return (
            <div className='empty-template'>
                <div className='flex align-items-center justify-content-center flex-column h-full'>
                    <i className='adms-upload media__upload-icon' />
                    <span className=' media__upload-icon-label'>Drag and drop image here</span>
                </div>
                <div className='media__upload-splitter h-full'>
                    <div className='media__line' />
                    <span>or</span>
                    <div className='media__line' />
                </div>
            </div>
        );
    };

    return (
        <div className='settings-form watermarking'>
            <div className='settings-form__title'>Watermarking</div>
            <div className='grid align-items-center'>
                <div className='col-6'>
                    <Checkbox
                        inputId='enableWatermark'
                        name='enableWatermark'
                        value={enableWatermark}
                        onChange={() => setEnableWatermark(!enableWatermark)}
                        checked
                    />
                    <label htmlFor='enableWatermark' className='ml-3 white-space-nowrap'>
                        Enable watermarking
                    </label>
                </div>

                <div className='col-6 py-0 flex watermarking__buttons justify-content-end'>
                    <Button
                        label='Restore default'
                        className='watermarking__button'
                        outlined
                        type='button'
                        severity='danger'
                    />
                    <Button
                        label='Preview'
                        className='watermarking__button'
                        outlined
                        type='button'
                    />
                </div>

                <div className='col-12 py-0'>
                    <hr className='form-line' />
                </div>

                <div className='col-12 py-0'>
                    <FileUpload
                        ref={fileUploadRef}
                        accept='image/*'
                        maxFileSize={limitations.maxSize * 1000000}
                        chooseLabel='Choose from files'
                        chooseOptions={{
                            icon: <></>,
                        }}
                        headerTemplate={chooseTemplate}
                        onSelect={(event) => {
                            store.watermarkImage = event.files[0];
                        }}
                        itemTemplate={itemTemplate}
                        emptyTemplate={emptyTemplate}
                        progressBarTemplate={<></>}
                        className='col-12'
                    />
                </div>

                <div className='col-12 watermarking__logo-settings'>
                    <Checkbox
                        inputId='addLogo'
                        name='addLogo'
                        value={logoSettings.logoenabled}
                        onChange={() =>
                            setLogoSettings({
                                ...logoSettings,
                                logoenabled: !logoSettings.logoenabled ? 1 : 0,
                            })
                        }
                        checked
                    />
                    <label htmlFor='addLogo' className='ml-3'>
                        Add logo
                    </label>

                    <span className='p-float-label watermarking__input'>
                        <InputNumber
                            value={logoSettings.logoposX}
                            allowEmpty
                            onChange={(e) =>
                                setLogoSettings({ ...logoSettings, logoposX: e.value || 0 })
                            }
                        />
                        <label className='float-label'>PosX</label>
                    </span>

                    <span className='p-float-label watermarking__input'>
                        <InputNumber
                            value={logoSettings.logoposY}
                            allowEmpty
                            onChange={(e) =>
                                setLogoSettings({ ...logoSettings, logoposY: e.value || 0 })
                            }
                        />
                        <label className='float-label'>PosY</label>
                    </span>
                </div>

                <div className='col-12 watermarking__accordion py-0'>
                    <Accordion>{renderTextBlocks()}</Accordion>
                    <Button
                        icon='pi pi-plus'
                        className='watermarking__add-button'
                        onClick={handleAddTextBlock}
                        label='Add new block'
                        outlined
                        type='button'
                    />
                </div>
            </div>
        </div>
    );
});
