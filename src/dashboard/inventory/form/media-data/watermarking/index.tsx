import "./index.css";
import { ReactElement, useEffect, useState } from "react";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useStore } from "store/hooks";
import { GeneralSettings, WatermarkPostProcessing } from "common/models/general-settings";
import { observer } from "mobx-react-lite";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ImagePreview } from "dashboard/inventory/form/media-data/watermarking/preview";

export const InventoryMediaWatermarking = observer((): ReactElement => {
    const [settingsStore, inventoryStore] = [
        useStore().generalSettingsStore,
        useStore().inventoryStore,
    ];
    const {
        settings,
        changeSettings,
        watermarkImage,
        postProcessing,
        changePostProcessing,
        restoreDefaultSettings,
    } = settingsStore;
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (watermarkImage && watermarkImage?.size) {
            settingsStore.watermarkImageUrl = URL.createObjectURL(watermarkImage);
            setHasChanges(true);
        }
    }, [watermarkImage]);

    const handleSettingsChange = (key: keyof GeneralSettings, value: number | string) => {
        changeSettings(key, value);
        setHasChanges(true);
        inventoryStore.isFormChanged = true;
    };

    const handlePostProcessingChange = (newBlocks: WatermarkPostProcessing[]) => {
        changePostProcessing(newBlocks);
        setHasChanges(true);
        inventoryStore.isFormChanged = true;
    };

    const handleRestoreDefault = () => {
        restoreDefaultSettings();
        setHasChanges(false);
        inventoryStore.isFormChanged = false;
    };

    const handleDeleteTextBlock = (index: number) => {
        const newTextBlocks = postProcessing.filter((_, i) => i !== index);
        handlePostProcessingChange(newTextBlocks);
    };

    const handleClearTextBlock = (index: number) => {
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
        settingsStore.watermarkImageUrl = "";
        handlePostProcessingChange(newTextBlocks);
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
        handlePostProcessingChange([...postProcessing, newTextBlock as WatermarkPostProcessing]);
    };

    const handlePreview = () => {
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
    };

    const renderTextBlocks = () => {
        const header = (blockIndex: number) => (
            <div className='flex align-items-center justify-content-between w-full'>
                {`TEXT BLOCK ${blockIndex + 1}`}
                <div
                    className='watermarking__accordion-header-buttons'
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        label='Clear'
                        text
                        className='watermarking__clear-button'
                        disabled={!postProcessing[blockIndex]?.ppText?.length}
                        severity={
                            !postProcessing[blockIndex]?.ppText?.length ? "secondary" : "success"
                        }
                        onClick={() => handleClearTextBlock(blockIndex)}
                    />
                    <Button
                        icon='icon adms-close'
                        tooltip='Delete block'
                        tooltipOptions={{ position: "mouse" }}
                        className='watermarking__remove-button'
                        text
                        disabled={postProcessing.length === 1}
                        severity={postProcessing.length === 1 ? "secondary" : "success"}
                        onClick={() => handleDeleteTextBlock(blockIndex)}
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
                <div className='grid gap-4 mt-0'>
                    <span className='col-12 p-0 p-float-label watermarking__textarea'>
                        <InputTextarea
                            value={block.ppText || ""}
                            onChange={(e) => {
                                const newTextBlocks = [...postProcessing];
                                newTextBlocks[index] = { ...block, ppText: e.target.value };
                                handlePostProcessingChange(newTextBlocks);
                            }}
                        />
                        <label className='float-label'>Text String</label>
                    </span>
                    <div className='col-12 p-0 flex align-items-center justify-content-between'>
                        <span className='p-float-label watermarking__font-input'>
                            <InputText
                                value={block.fontName || ""}
                                onChange={(e) => {
                                    const newTextBlocks = [...postProcessing];
                                    newTextBlocks[index] = { ...block, fontName: e.target.value };
                                    handlePostProcessingChange(newTextBlocks);
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
                                    handlePostProcessingChange(newTextBlocks);
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
                                    handlePostProcessingChange(newTextBlocks);
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
                                    handlePostProcessingChange(newTextBlocks);
                                }}
                            />
                            <label className='float-label'>PosY</label>
                        </span>
                    </div>
                </div>
            </AccordionTab>
        ));
    };

    return (
        <div className='settings-form watermarking'>
            <div className='grid align-items-center mt-0'>
                <div className='col-6'>
                    <Checkbox
                        inputId='enableWatermark'
                        name='enableWatermark'
                        checked={!!settings.watermarkenabled}
                        onChange={(e) =>
                            handleSettingsChange("watermarkenabled", e.checked ? 1 : 0)
                        }
                    />
                    <label htmlFor='enableWatermark' className='ml-3 white-space-nowrap'>
                        Enable watermarking
                    </label>
                </div>

                <div className='col-6 py-0 flex watermarking__buttons justify-content-end'>
                    <Button
                        label='Restore default'
                        className='watermarking__button'
                        onClick={handleRestoreDefault}
                        outlined
                        type='button'
                        severity={hasChanges ? "danger" : "secondary"}
                        disabled={!hasChanges}
                    />
                    <Button
                        label='Preview'
                        className='watermarking__button'
                        onClick={handlePreview}
                        outlined
                        type='button'
                        severity={hasChanges ? "success" : "secondary"}
                        disabled={!hasChanges}
                    />
                </div>

                <div className='col-12 py-0'>
                    <hr className='form-line' />
                </div>

                <div className='col-12 watermarking__logo-settings'>
                    <Checkbox
                        inputId='addLogo'
                        name='addLogo'
                        checked={!!settings.logoenabled}
                        onChange={(e) => {
                            handleSettingsChange("logoenabled", e.checked ? 1 : 0);
                        }}
                    />
                    <label htmlFor='addLogo' className='ml-3'>
                        Add logo
                    </label>

                    <span className='p-float-label watermarking__input'>
                        <InputNumber
                            value={settings.logoposX}
                            allowEmpty
                            onChange={(e) => {
                                handleSettingsChange("logoposX", e.value || 0);
                            }}
                        />
                        <label className='float-label'>PosX</label>
                    </span>

                    <span className='p-float-label watermarking__input'>
                        <InputNumber
                            value={settings.logoposY}
                            allowEmpty
                            onChange={(e) => {
                                handleSettingsChange("logoposY", e.value || 0);
                            }}
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

            {isPreviewOpen && <ImagePreview onClose={handleClosePreview} />}
        </div>
    );
});
