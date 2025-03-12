import "./index.css";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { InputNumber } from "primereact/inputnumber";
import { Accordion, AccordionTab } from "primereact/accordion";
import { getWatermark } from "http/services/settings.service";
import { useToast } from "dashboard/common/toast";
import { TOAST_LIFETIME } from "common/settings";
import { useStore } from "store/hooks";
import { GeneralSettings, WatermarkPostProcessing } from "common/models/general-settings";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
    limitations,
    chooseTemplate,
    itemTemplate,
    emptyTemplate,
} from "dashboard/profile/generalSettings/watermarking/common";

type LogoSettings = Partial<Pick<GeneralSettings, "logoenabled" | "logoposX" | "logoposY">>;

export const SettingsWatermarking = observer(() => {
    const store = useStore().generalSettingsStore;
    const { settings, postProcessing, getPostProcessing, changePostProcessing } = store;
    const [enableWatermark, setEnableWatermark] = useState<boolean>(false);
    const [logoSettings, setLogoSettings] = useState<LogoSettings>({ logoenabled: 0 });
    const fileUploadRef = useRef<FileUpload>(null);
    const toast = useToast();

    useEffect(() => {
        getPostProcessing();
        if (settings.logomediauid) {
            handleGetWatermark();
        }
    }, []);

    const handleDeletePostProcessing = (index: number) => {
        const newTextBlocks = postProcessing.filter((_, i) => i !== index);
        changePostProcessing(newTextBlocks);
    };

    const handleUpdatePostProcessing = (index: number) => {
        const newTextBlocks = [...postProcessing];
        newTextBlocks[index] = {
            id: postProcessing[index]?.id || 0,
            ppText: "",
            fontName: "",
            fontSize: 0,
            posX: 0,
            posY: 0,
            ppPattern: "",
            fontColor: 0,
            bkColor: 0,
            useruid: postProcessing[index]?.useruid || "",
        } as WatermarkPostProcessing;
        changePostProcessing(newTextBlocks);
    };

    const handleCreateNewPostProcessing = () => {
        const newTextBlock: Partial<WatermarkPostProcessing> = {
            id: postProcessing.length,
            ppText: "",
            fontName: "",
            fontSize: 0,
            posX: 0,
            posY: 0,
            ppPattern: "",
            fontColor: 0,
            bkColor: 0,
            useruid: "",
        };
        changePostProcessing([...postProcessing, newTextBlock]);
    };

    const renderTextBlocks = () => {
        const header = (blockIndex: number) => (
            <div className='flex align-items-center justify-content-between w-full'>
                {`TEXT BLOCK ${blockIndex + 1}`}
                <div className='watermarking__accordion-header-buttons'>
                    <Button
                        label='Clear'
                        text
                        className='watermarking__clear-button'
                        disabled={!postProcessing[blockIndex]?.ppText?.length}
                        severity={
                            !postProcessing[blockIndex]?.ppText?.length ? "secondary" : "success"
                        }
                        onClick={() => handleUpdatePostProcessing(blockIndex)}
                    />
                    <Button
                        icon='icon adms-close'
                        className='watermarking__remove-button'
                        text
                        onClick={() => handleDeletePostProcessing(blockIndex)}
                    />
                </div>
            </div>
        );

        return postProcessing.map((block, index) => (
            <AccordionTab
                header={header(index)}
                key={index}
                className='watermarking__accordion-tab'
                contentClassName='watermarking__accordion-content'
            >
                <div className='grid gap-3 mt-0'>
                    <span className='col-12 p-0 p-float-label watermarking__textarea'>
                        <InputTextarea
                            value={block.ppText || ""}
                            onChange={(e) => {
                                const newTextBlocks = [...postProcessing];
                                newTextBlocks[index] = { ...block, ppText: e.target.value };
                                changePostProcessing(newTextBlocks);
                            }}
                        />
                        <label className='float-label'>Text</label>
                    </span>
                    <div className='col-12 p-0 flex align-items-center justify-content-between'>
                        <span className='p-float-label watermarking__font-input'>
                            <InputText
                                value={block.fontName || ""}
                                onChange={(e) => {
                                    const newTextBlocks = [...postProcessing];
                                    newTextBlocks[index] = { ...block, fontName: e.target.value };
                                    changePostProcessing(newTextBlocks);
                                }}
                            />
                            <label className='float-label'>Font name</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={Number(block.fontSize) || 0}
                                onChange={(e) => {
                                    const newTextBlocks = [...postProcessing];
                                    newTextBlocks[index] = {
                                        ...block,
                                        fontSize: Number(e.value) || 0,
                                    };
                                    changePostProcessing(newTextBlocks);
                                }}
                            />
                            <label className='float-label'>Font size</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={block.posX || 0}
                                onChange={(e) => {
                                    const newTextBlocks = [...postProcessing];
                                    newTextBlocks[index] = { ...block, posX: Number(e.value) || 0 };
                                    changePostProcessing(newTextBlocks);
                                }}
                            />
                            <label className='float-label'>PosX</label>
                        </span>
                        <span className='p-float-label watermarking__input'>
                            <InputNumber
                                value={block.posY || 0}
                                onChange={(e) => {
                                    const newTextBlocks = [...postProcessing];
                                    newTextBlocks[index] = { ...block, posY: Number(e.value) || 0 };
                                    changePostProcessing(newTextBlocks);
                                }}
                            />
                            <label className='float-label'>PosY</label>
                        </span>
                    </div>
                </div>
            </AccordionTab>
        ));
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
                        onRemove={() => {
                            store.watermarkImage = null;
                            store.changeSettings("logomediauid", "", true);
                        }}
                        headerTemplate={chooseTemplate}
                        onSelect={(event) => {
                            store.watermarkImage = event.files[0];
                        }}
                        itemTemplate={(file, options) => itemTemplate(file, options, fileUploadRef)}
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
                        onClick={handleCreateNewPostProcessing}
                        label='Add new block'
                        outlined
                        type='button'
                    />
                </div>
            </div>
        </div>
    );
});
