import "./index.css";
import { ChangeEvent, ReactElement, useEffect, useMemo, useRef, useState } from "react";
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
import WaveSurfer from "wavesurfer.js";
import { CATEGORIES, UPLOAD_TEXT } from "common/constants/media-categories";
import { AppColors } from "common/models/css-variables";
import { Loader } from "dashboard/common/loader";
import { emptyTemplate } from "dashboard/common/form/upload";
import { ComboBox } from "dashboard/common/form/dropdown";
import { ConfirmModal } from "dashboard/common/dialog/confirm";

const formatDuration = (seconds?: number) => {
    if (!seconds) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const limitations: MediaLimitations = {
    formats: ["WAV", "MP3", "MP4"],
    codecs: "PCM (WAV), MP3, AAC (MP4)",
    maxDuration: 300,
    maxSize: 8,
    maxUpload: 8,
    maxMediaCount: 8,
};

enum ModalInfo {
    TITLE = "Are you sure?",
    BODY = "Do you really want to delete this audio file? This process cannot be undone.",
    ACCEPT = "Delete",
}

export const AudioMedia = observer((): ReactElement => {
    const store = useStore().inventoryStore;
    const {
        saveInventoryAudios,
        uploadFileAudios,
        audios,
        isLoading,
        removeMedia,
        clearMedia,
        fetchAudios,
    } = store;
    const [totalCount, setTotalCount] = useState(0);
    const fileUploadRef = useRef<FileUpload>(null);
    const [activeItemuid, setActiveItemuid] = useState<string | null>(null);

    const uniqueAudio = useMemo(() => {
        const audiosSet = new Set();
        return audios.filter((aud) => {
            if (!aud.itemuid || audiosSet.has(aud.itemuid)) return false;
            audiosSet.add(aud.itemuid);
            return true;
        });
    }, [audios]);

    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [itemuid, setItemuid] = useState<string>("");
    const [audioDurations, setAudioDurations] = useState<Record<string, number>>({});

    useEffect(() => {
        uniqueAudio.forEach((audio) => {
            const currentItemuid = audio.itemuid;
            if (
                currentItemuid &&
                audio.src &&
                !audio.info?.duration &&
                audioDurations[currentItemuid] === undefined
            ) {
                const audioObject = new Audio();
                audioObject.preload = "metadata";
                audioObject.src = audio.src;
                audioObject.onloadedmetadata = () => {
                    if (audioObject.duration && !isNaN(audioObject.duration)) {
                        setAudioDurations((prev) => ({
                            ...prev,
                            [currentItemuid]: audioObject.duration,
                        }));
                    }
                };
            }
        });
    }, [uniqueAudio, audioDurations]);

    useEffect(() => {
        fetchAudios();

        return () => {
            clearMedia();
        };
    }, []);

    const handleCategorySelect = (e: DropdownChangeEvent) => {
        store.uploadFileAudios = {
            ...store.uploadFileAudios,
            data: {
                ...store.uploadFileAudios.data,
                contenttype: e.target.value,
            },
        };
    };

    const handleCommentaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        store.uploadFileAudios = {
            ...store.uploadFileAudios,
            data: {
                ...store.uploadFileAudios.data,
                notes: e.target.value,
            },
        };
    };

    const onTemplateSelect = (e: FileUploadSelectEvent) => {
        store.uploadFileAudios = {
            ...store.uploadFileAudios,
            file: e.files,
        };
        setTotalCount(e.files.length);
    };

    const onTemplateUpload = (e: FileUploadUploadEvent) => {
        setTotalCount(e.files.length);
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        const newFiles = {
            file: uploadFileAudios.file.filter((item) => item.name !== file.name),
            data: uploadFileAudios.data,
        };
        store.uploadFileAudios = newFiles;
        setTotalCount(newFiles.file.length);
        callback();
    };

    const handleUploadFiles = () => {
        saveInventoryAudios().then((res) => {
            if (res) {
                fileUploadRef.current?.clear();
            }
        });
    };

    const handleDeleteAudio = (mediauid: string) => {
        removeMedia(mediauid, fetchAudios);
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
                        className='presentation__audio'
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
                        To upload more drag and drop audio files
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
                                        <b> Supported codecs</b>: {limitations.codecs}
                                    </p>
                                    <p>
                                        <b>Supported formats</b>:
                                        {limitations.formats.map((format, index) => (
                                            <span key={index}>
                                                {format}
                                                {index !== limitations.formats.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </p>
                                    <p>
                                        <b>Maximal duration</b>: {limitations.maxDuration} seconds
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
                accept='audio/*'
                maxFileSize={limitations.maxSize * 1000000}
                onUpload={onTemplateUpload}
                headerTemplate={limitations.maxUpload > totalCount ? chooseTemplate : <div></div>}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate("audio files")}
                onSelect={onTemplateSelect}
                chooseOptions={chooseOptions}
                progressBarTemplate={<></>}
                className='col-12'
                style={{ "--upload-text": `"${UPLOAD_TEXT.AUDIO}"` } as React.CSSProperties}
            />
            <div className='col-12 mt-4 media-input'>
                <ComboBox
                    className='media-input__dropdown'
                    placeholder='Category'
                    optionLabel={"name"}
                    optionValue={"id"}
                    options={[...CATEGORIES]}
                    value={uploadFileAudios?.data?.contenttype || 0}
                    onChange={handleCategorySelect}
                />
                <InputText
                    className='media-input__text'
                    placeholder='Comment'
                    value={uploadFileAudios?.data?.notes || ""}
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
                <h2 className='media-uploaded__title uppercase m-0'>uploaded audio files</h2>
                <span
                    className={`media-uploaded__label mx-2 uploaded-count ${
                        audios.length && "uploaded-count--blue"
                    }`}
                >
                    ({audios.length}/{limitations.maxMediaCount})
                </span>
                <hr className='media-uploaded__line flex-1' />
            </div>
            <div className='media-grid'>
                {isLoading && <Loader />}
                {!isLoading && uniqueAudio.length ? (
                    uniqueAudio.map((audio, index: number) => {
                        const { itemuid, info } = audio;
                        const isActive = activeItemuid === itemuid;
                        return (
                            <div
                                key={itemuid}
                                className={`media-item media-audio__item ${
                                    isActive ? "media-audio__item--active" : ""
                                }`}
                            >
                                {isActive ? (
                                    <AudioPlayer
                                        audio={audio}
                                        onClose={() => setActiveItemuid(null)}
                                    />
                                ) : (
                                    <>
                                        <div
                                            className='media-audio__clickable'
                                            onClick={() => setActiveItemuid(itemuid)}
                                        >
                                            <div className='media-audio__icon-container'>
                                                <i className='icon adms-play media-audio__icon' />
                                                <span className='media-audio__duration'>
                                                    {formatDuration(
                                                        info?.duration || audioDurations[itemuid]
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='media-info'>
                                            <div className='media-info__item'>
                                                <span className='media-info__icon'>
                                                    <i className='pi pi-th-large' />
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
                                                        <i className='pi pi-comment' />
                                                    </span>
                                                </span>
                                                <span className='media-info__text'>
                                                    {info?.notes}
                                                </span>
                                            </div>
                                            <div className='media-info__item'>
                                                <span className='media-info__icon'>
                                                    <i className='pi pi-calendar' />
                                                </span>
                                                <span className='media-info__text'>
                                                    {info?.created}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='media-audio__actions'>
                                            <button
                                                type='button'
                                                className='media-audio__action'
                                                onClick={() => handleModalOpen(itemuid)}
                                            >
                                                <i className='pi pi-times' />
                                            </button>
                                        </div>
                                    </>
                                )}
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
                    handleDeleteAudio(itemuid);
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

interface AudioPlayerProps {
    audio: any;
    onClose: () => void;
}

const AudioPlayer = ({ audio, onClose }: AudioPlayerProps) => {
    const { src } = audio;
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    useEffect(() => {
        if (!containerRef.current) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            waveColor: getComputedStyle(document.documentElement).getPropertyValue(
                `--admss-app-${AppColors.LIGHT_BLUE}`
            ),
            progressColor: getComputedStyle(document.documentElement).getPropertyValue(
                `--admss-app-${AppColors.MAIN_BLUE}`
            ),
            cursorColor: "transparent",
            barWidth: 2,
            barGap: 3,
            barRadius: 2,
            height: 40,
            url: src,
        });

        wavesurferRef.current = ws;

        ws.on("play", () => setIsPlaying(true));
        ws.on("pause", () => setIsPlaying(false));
        ws.on("timeupdate", (time) => setCurrentTime(time));
        ws.on("ready", () => {
            ws.play();
        });

        ws.on("finish", () => {
            setIsPlaying(false);
            ws.setTime(0);
        });

        return () => {
            ws.destroy();
        };
    }, [src]);

    const togglePlay = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    };

    const changePlaybackRate = () => {
        const rates = [1, 1.5, 2];
        const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        setPlaybackRate(nextRate);
        if (wavesurferRef.current) {
            wavesurferRef.current.setPlaybackRate(nextRate);
        }
    };

    return (
        <div className='custom-audio-player'>
            <div className='player-main'>
                <div className='player-left'>
                    <button type='button' className='player-play-pause' onClick={togglePlay}>
                        <i className={`icon ${isPlaying ? "adms-pause" : "adms-play"}`} />
                    </button>
                    <span className={`player-time ${isPlaying ? "player-time--playing" : ""}`}>
                        {formatDuration(currentTime)}
                    </span>
                </div>

                <div className='player-center'>
                    <div ref={containerRef} className='waveform-container' />
                    <span className='player-speed' onClick={changePlaybackRate}>
                        {playbackRate === 1 ? "1x" : `${playbackRate}x`}
                    </span>
                </div>

                <button type='button' className='player-close-btn' onClick={onClose}>
                    <i className='pi pi-times' />
                </button>
            </div>
        </div>
    );
};
